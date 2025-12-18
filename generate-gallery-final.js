import https from 'https';
import fs from 'fs';

// Force immediate console output
process.stdout.write('\n🚀 SCRIPT DÉMARRÉ !\n\n');

// Configuration Bunny CDN
const BUNNY_STORAGE_ZONE = 'gabaritkdp-images';
const BUNNY_API_KEY = 'b3640eb6-c8bd-4afd-8ce4a1bab3ed-e35b-45db';
const CDN_BASE_URL = 'https://cdn.gabaritkdp.com';

console.log('📦 Configuration chargée:');
console.log(`   Storage Zone: ${BUNNY_STORAGE_ZONE}`);
console.log(`   API Key: ${BUNNY_API_KEY.substring(0, 20)}...`);
console.log(`   CDN URL: ${CDN_BASE_URL}\n`);

// Fonction pour faire des requêtes HTTPS avec timeout
function httpsRequest(options, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data.substring(0, 200)}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
    
    req.end();
  });
}

// Test de connexion Bunny API
async function testConnection() {
  console.log('🔌 Test de connexion à Bunny API...');
  
  try {
    const options = {
      hostname: 'storage.bunnycdn.com',
      path: `/${BUNNY_STORAGE_ZONE}/`,
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_API_KEY
      }
    };
    
    console.log(`   Requête: https://${options.hostname}${options.path}`);
    const result = await httpsRequest(options, 10000);
    console.log(`   ✅ Connexion réussie ! ${result.length} éléments trouvés.\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Échec connexion: ${error.message}\n`);
    return false;
  }
}

// Liste les fichiers d'un dossier Bunny Storage
async function listBunnyFiles(path = '') {
  const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
  const options = {
    hostname: 'storage.bunnycdn.com',
    path: `/${BUNNY_STORAGE_ZONE}/${encodedPath}/`,
    method: 'GET',
    headers: {
      'AccessKey': BUNNY_API_KEY
    }
  };

  return await httpsRequest(options);
}

// Scan récursif de tous les fichiers
async function scanDirectory(basePath = '', depth = 0) {
  const indent = '  '.repeat(depth);
  process.stdout.write(`${indent}📂 ${basePath || '/'} ... `);
  
  try {
    const items = await listBunnyFiles(basePath);
    console.log(`(${items.length} éléments)`);
    
    const files = [];
    
    for (const item of items) {
      const fullPath = basePath ? `${basePath}/${item.ObjectName}` : item.ObjectName;
      
      if (item.IsDirectory) {
        console.log(`${indent}  ├─ 📁 ${item.ObjectName}/`);
        const subFiles = await scanDirectory(fullPath, depth + 1);
        files.push(...subFiles);
      } else {
        const sizeKB = Math.round(item.Length / 1024);
        console.log(`${indent}  ├─ 📄 ${item.ObjectName} (${sizeKB}KB)`);
        files.push({
          path: fullPath,
          size: item.Length,
          lastModified: item.LastChanged
        });
      }
    }
    
    return files;
  } catch (error) {
    console.log(`❌ ERREUR`);
    console.error(`${indent}  Error: ${error.message}`);
    return [];
  }
}

// Extrait les tags d'un chemin
function extractTags(path) {
  const parts = path.split('/').filter(p => p);
  const tags = [];
  
  for (const part of parts) {
    const normalized = part
      .toLowerCase()
      .replace(/[_-]/g, ' ')
      .trim();
    
    if (normalized && !tags.includes(normalized)) {
      tags.push(normalized);
    }
  }
  
  return tags;
}

// Parse un fichier en objet structuré
function parseFile(file, baseFolder) {
  const pathParts = file.path.replace(`${baseFolder}/`, '').split('/');
  const filename = pathParts.pop();
  const folder = pathParts.join('/');
  const extension = filename.split('.').pop().toLowerCase();
  
  return {
    url: `${CDN_BASE_URL}/${file.path}`,
    tags: extractTags(folder),
    filename: filename,
    folder: folder,
    size: file.size,
    extension: extension
  };
}

// Génère le fichier gallery.json complet
async function generateGallery() {
  console.log('━'.repeat(60));
  console.log('🚀 GÉNÉRATION GALLERY.JSON');
  console.log('━'.repeat(60) + '\n');

  try {
    // Test de connexion d'abord
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Impossible de se connecter à Bunny API. Vérifiez votre connexion internet et l\'API key.');
    }

    // Scan backgrounds
    console.log('📸 SCANNING BACKGROUNDS...\n');
    const backgroundFiles = await scanDirectory('backgrounds');
    console.log(`\n   ✅ ${backgroundFiles.length} backgrounds trouvés\n`);
    
    const backgrounds = backgroundFiles
      .map(f => parseFile(f, 'backgrounds'))
      .sort((a, b) => a.folder.localeCompare(b.folder) || a.filename.localeCompare(b.filename));

    // Scan full covers
    console.log('📚 SCANNING FULL COVERS...\n');
    const fullCoverFiles = await scanDirectory('FULL COVER');
    console.log(`\n   ✅ ${fullCoverFiles.length} full covers trouvés\n`);
    
    const fullcovers = fullCoverFiles
      .map(f => parseFile(f, 'FULL COVER'))
      .sort((a, b) => a.folder.localeCompare(b.folder) || a.filename.localeCompare(b.filename));

    // Construction de l'objet final
    const gallery = {
      backgrounds: backgrounds,
      fullcovers: fullcovers,
      metadata: {
        generated: new Date().toISOString(),
        totalFiles: backgrounds.length + fullcovers.length,
        backgroundsCount: backgrounds.length,
        fullcoversCount: fullcovers.length,
        storageZone: BUNNY_STORAGE_ZONE,
        cdnUrl: CDN_BASE_URL
      }
    };

    // Statistiques par dossier
    const bgFolders = {};
    backgrounds.forEach(f => {
      bgFolders[f.folder] = (bgFolders[f.folder] || 0) + 1;
    });

    const fcFolders = {};
    fullcovers.forEach(f => {
      fcFolders[f.folder] = (fcFolders[f.folder] || 0) + 1;
    });

    // Écriture du fichier
    console.log('💾 Écriture de gallery.json...');
    fs.writeFileSync('gallery.json', JSON.stringify(gallery, null, 2));
    const fileSize = Math.round(fs.statSync('gallery.json').size / 1024);

    // Affichage des statistiques
    console.log('\n' + '━'.repeat(60));
    console.log('✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS !');
    console.log('━'.repeat(60));
    console.log(`\n📊 STATISTIQUES:`);
    console.log(`   Total fichiers: ${gallery.metadata.totalFiles}`);
    console.log(`   Backgrounds: ${backgrounds.length}`);
    console.log(`   Full Covers: ${fullcovers.length}`);
    console.log(`   Fichier généré: gallery.json (${fileSize}KB)`);
    
    console.log(`\n📁 BACKGROUNDS par dossier:`);
    Object.entries(bgFolders)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([folder, count]) => {
        console.log(`   ${folder || '(root)'}: ${count} fichiers`);
      });
    
    console.log(`\n📁 FULL COVERS par dossier:`);
    Object.entries(fcFolders)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([folder, count]) => {
        console.log(`   ${folder || '(root)'}: ${count} fichiers`);
      });

    console.log('\n🎉 PRÊT POUR LE DÉPLOIEMENT !\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Lancement du script
console.log('▶️  Lancement de la génération...\n');
generateGallery().catch(error => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});
