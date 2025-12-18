// 🚀 GÉNÉRATEUR AUTOMATIQUE DE GALLERY.JSON depuis Bunny CDN
// Ce script scanne ton Bunny CDN et génère gallery.json automatiquement

const https = require('https');
const fs = require('fs');

// ⚙️ CONFIGURATION - PRÊT À L'EMPLOI
const CONFIG = {
  // Informations Bunny CDN
  storageZoneName: 'gabaritkdp-images',  // ← Ta Storage Zone
  apiKey: 'b3640eb6-c8bd-4afd-8ce4a1bab3ed-e35b-45db',  // ← Ton API Key (Password)
  cdnUrl: 'https://gabaritkdp.b-cdn.net',  // ← URL CDN publique
  
  // Dossier racine à scanner (vide = tout scanner)
  rootFolder: '',  // ← Scanne tout (12,441 objets)
  
  // Fichier de sortie
  outputFile: 'gallery.json'
};

// 📡 Fonction pour appeler l'API Bunny Storage
function bunnyApiRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'storage.bunnycdn.com',
      path: `/${CONFIG.storageZoneName}/${path}`,
      method: 'GET',
      headers: {
        'AccessKey': CONFIG.apiKey,
        'Accept': 'application/json'
      }
    };

    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Erreur parsing JSON: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// 🔍 Fonction récursive pour scanner tous les fichiers
async function scanFolder(folderPath = '') {
  console.log(`📂 Scan: ${folderPath || 'root'}...`);
  
  let allFiles = [];
  
  try {
    const items = await bunnyApiRequest(folderPath);
    
    for (const item of items) {
      if (item.IsDirectory) {
        // C'est un dossier, on le scanne récursivement
        const subFolderPath = folderPath ? `${folderPath}/${item.ObjectName}` : item.ObjectName;
        const subFiles = await scanFolder(subFolderPath);
        allFiles = allFiles.concat(subFiles);
        
      } else {
        // C'est un fichier image
        const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const fileName = item.ObjectName.toLowerCase();
        
        if (extensions.some(ext => fileName.endsWith(ext))) {
          const filePath = folderPath ? `${folderPath}/${item.ObjectName}` : item.ObjectName;
          
          allFiles.push({
            filename: item.ObjectName,
            url: `${CONFIG.cdnUrl}/${filePath}`,
            size: item.Length,
            path: filePath,
            lastModified: item.LastChanged
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erreur scan ${folderPath}:`, error.message);
  }
  
  return allFiles;
}

// 🎯 Fonction principale
async function generateGalleryJson() {
  console.log('🚀 Démarrage de la génération de gallery.json\n');
  console.log(`📦 Storage Zone: ${CONFIG.storageZoneName}`);
  console.log(`🔗 CDN URL: ${CONFIG.cdnUrl}`);
  console.log(`📁 Dossier racine: ${CONFIG.rootFolder || 'tout'}\n`);
  
  try {
    // Scanner tous les fichiers
    const startTime = Date.now();
    const files = await scanFolder(CONFIG.rootFolder);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Scan terminé en ${duration}s`);
    console.log(`📊 Total: ${files.length} images trouvées\n`);
    
    // Organiser par catégorie (optionnel)
    const gallery = {
      generated: new Date().toISOString(),
      totalFiles: files.length,
      fullcovers: files,
      
      // Statistiques par dossier
      stats: {}
    };
    
    // Calculer les stats
    files.forEach(file => {
      const pathParts = file.path.split('/');
      const category = pathParts[1] || 'other';  // Ex: "Art", "Romance", etc.
      
      if (!gallery.stats[category]) {
        gallery.stats[category] = 0;
      }
      gallery.stats[category]++;
    });
    
    // Sauvegarder le fichier
    fs.writeFileSync(
      CONFIG.outputFile,
      JSON.stringify(gallery, null, 2),
      'utf8'
    );
    
    console.log('📊 STATISTIQUES PAR CATÉGORIE:');
    console.log('─'.repeat(40));
    Object.entries(gallery.stats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category.padEnd(20)} ${count} images`);
      });
    console.log('─'.repeat(40));
    console.log(`  TOTAL${' '.repeat(15)} ${files.length} images\n`);
    
    console.log(`✅ Fichier généré: ${CONFIG.outputFile}`);
    console.log(`📦 Taille: ${(fs.statSync(CONFIG.outputFile).size / 1024).toFixed(2)} KB\n`);
    
    console.log('🎉 Terminé ! Tu peux maintenant upload gallery.json sur ton site.\n');
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('\n💡 Vérifie que:');
    console.error('  1. Le storageZoneName est correct');
    console.error('  2. L\'API Key est valide');
    console.error('  3. Tu as bien les permissions sur la Storage Zone\n');
  }
}

// ▶️ EXÉCUTION
generateGalleryJson();


// 📖 COMMENT UTILISER CE SCRIPT :
//
// 1. Installe Node.js (si pas déjà fait): https://nodejs.org
//
// 2. Copie tes infos Bunny CDN:
//    - Va sur https://dash.bunny.net/storage
//    - Copie le nom de ta Storage Zone
//    - Va dans Account > API et copie ton API Key
//    - Remplace les valeurs dans CONFIG ci-dessus
//
// 3. Exécute le script:
//    node generate-gallery-bunny.js
//
// 4. Le fichier gallery.json sera créé automatiquement
//
// 5. Upload gallery.json sur ton site
//
// 6. Tes pages afficheront les images automatiquement !
//
// 💡 RELANCE CE SCRIPT chaque fois que tu ajoutes des images
//    Il mettra à jour gallery.json automatiquement
