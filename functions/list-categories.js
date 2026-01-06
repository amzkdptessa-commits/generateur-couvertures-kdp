// 🚀 NETLIFY FUNCTION - Liste automatique des catégories (dossiers)
// Cette function scanne Bunny CDN et retourne la liste des dossiers disponibles

import https from 'https';

const BUNNY_CONFIG = {
  storageZoneName: process.env.BUNNY_STORAGE_ZONE || 'gabaritkdp-images',
  apiKey: process.env.BUNNY_API_KEY,
  cdnUrl: process.env.BUNNY_CDN_URL || 'https://gabaritkdp.b-cdn.net',
  storageHost: process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com'
};

function bunnyApiRequest(path) {
  return new Promise((resolve, reject) => {
    const encodedPath = path
      ? path.split('/').map(p => encodeURIComponent(p)).join('/')
      : '';

    // Slash final pour lister un dossier
    const apiPath = encodedPath
      ? `/${BUNNY_CONFIG.storageZoneName}/${encodedPath}/`
      : `/${BUNNY_CONFIG.storageZoneName}/`;

    const options = {
      hostname: BUNNY_CONFIG.storageHost,
      path: apiPath,
      method: 'GET',
      headers: {
        'AccessKey': BUNNY_CONFIG.apiKey,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`[Bunny] GET ${options.hostname}${apiPath} -> ${res.statusCode}`);
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
        try {
          const parsed = JSON.parse(data);
          const items = Array.isArray(parsed) ? parsed : (parsed.Items || []);
          resolve(items);
        } catch (e) {
          reject(new Error('Erreur parsing JSON: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Scanner récursivement les catégories
async function scanCategories(basePath, depth = 0, maxDepth = 2) {
  const categories = [];
  
  try {
    const items = await bunnyApiRequest(basePath);
    
    for (const item of items) {
      if (item.IsDirectory) {
        const folderPath = basePath ? `${basePath}/${item.ObjectName}` : item.ObjectName;
        
        // Compter les images dans ce dossier
        const imageCount = await countImages(folderPath);
        
        categories.push({
          name: item.ObjectName,
          path: folderPath,
          imageCount: imageCount,
          lastModified: item.LastChanged
        });
        
        // Si on n'a pas atteint la profondeur max, scanner les sous-dossiers
        if (depth < maxDepth) {
          const subCategories = await scanCategories(folderPath, depth + 1, maxDepth);
          if (subCategories.length > 0) {
            categories.push(...subCategories);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Erreur scan ${basePath || 'root'}:`, error.message);
  }
  
  return categories;
}

// Compter les images dans un dossier (récursif)
async function countImages(folderPath) {
  let count = 0;
  
  try {
    const items = await bunnyApiRequest(folderPath);
    
    for (const item of items) {
      if (item.IsDirectory) {
        // Sous-dossier, compter récursivement
        count += await countImages(`${folderPath}/${item.ObjectName}`);
      } else {
        // Fichier, vérifier si c'est une image
        const fileName = (item.ObjectName || '').toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => fileName.endsWith(ext))) {
          count++;
        }
      }
    }
  } catch (error) {
    console.error(`Erreur comptage ${folderPath}:`, error.message);
  }
  
  return count;
}

// Handler de la Netlify Function
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Récupérer le dossier de base (par défaut: FULL COVER)
    const baseFolder = event.queryStringParameters?.folder || 'FULL COVER';
    
    console.log(`Scanning categories in: ${baseFolder}`);
    
    // Scanner les catégories
    const categories = await scanCategories(baseFolder);
    
    console.log(`Total categories found: ${categories.length}`);
    
    // Organiser par dossier parent
    const organized = {};
    categories.forEach(cat => {
      const parts = cat.path.split('/');
      const parent = parts.slice(0, -1).join('/') || 'root';
      
      if (!organized[parent]) {
        organized[parent] = [];
      }
      organized[parent].push(cat);
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        generated: new Date().toISOString(),
        baseFolder: baseFolder,
        totalCategories: categories.length,
        categories: categories,
        organized: organized
      })
    };
    
  } catch (error) {
    console.error('Erreur dans la function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}
