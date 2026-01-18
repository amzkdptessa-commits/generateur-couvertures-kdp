// 🚀 NETLIFY FUNCTION - Liste automatique des images depuis Bunny CDN
// VERSION CORRIGÉE par ChatGPT - Résout les problèmes d'hostname et de slash final

import https from 'https';

// Configuration Bunny CDN (utilise les variables d'environnement Netlify)
const BUNNY_CONFIG = {
  storageZoneName: process.env.BUNNY_STORAGE_ZONE || 'gabaritkdp-images',
  apiKey: process.env.BUNNY_API_KEY, // Storage Zone Password (FTP & HTTP API)
  cdnUrl: process.env.BUNNY_CDN_URL || 'https://gabaritkdp.b-cdn.net',
  storageHost: process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com' // Hostname de région
};

// Fonction pour appeler l'API Bunny
function bunnyApiRequest(path, { listDirectory = false } = {}) {
  return new Promise((resolve, reject) => {
    const encodedPath = path
      ? path.split('/').map(p => encodeURIComponent(p)).join('/')
      : '';

    // IMPORTANT: slash final pour lister un dossier
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
        // Logging utile pour Netlify
        console.log(`[Bunny] GET ${options.hostname}${apiPath} -> ${res.statusCode}`);
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
        try {
          const parsed = JSON.parse(data);
          const items = Array.isArray(parsed) ? parsed : (parsed.Items || []);
          resolve(items);
        } catch (e) {
          reject(new Error('Erreur parsing JSON: ' + e.message + ' | payload=' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Scanner récursivement un dossier
async function scanFolder(folderPath) {
  let allFiles = [];
  try {
    const items = await bunnyApiRequest(folderPath, { listDirectory: true });

    for (const item of items) {
      if (item.IsDirectory) {
        const subFolderPath = folderPath ? `${folderPath}/${item.ObjectName}` : item.ObjectName;
        const subFiles = await scanFolder(subFolderPath);
        allFiles = allFiles.concat(subFiles);
      } else {
        const fileName = (item.ObjectName || '').toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].some(ext => fileName.endsWith(ext))) {
          const filePath = folderPath ? `${folderPath}/${item.ObjectName}` : item.ObjectName;
          const encodedFilePath = filePath.split('/').map(p => encodeURIComponent(p)).join('/');
          allFiles.push({
            filename: item.ObjectName,
            url: `${BUNNY_CONFIG.cdnUrl}/${encodedFilePath}`,
            size: item.Length,
            path: filePath,
            lastModified: item.LastChanged
          });
        }
      }
    }
  } catch (error) {
    console.error(`Erreur scan ${folderPath || '(root)'}:`, error.message);
  }
  return allFiles;
}

// Handler de la Netlify Function
export async function handler(event, context) {
  // CORS headers pour autoriser les requêtes depuis ton site
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Récupérer le paramètre 'folder' depuis la query string
    const folder = event.queryStringParameters?.folder || '';
    
    // Décoder le paramètre (les espaces arrivent en %20)
    const decodedFolder = decodeURIComponent(folder);
    
    console.log(`Scanning folder: ${decodedFolder || 'root'}`);
    
    // Scanner le dossier demandé
    const files = await scanFolder(decodedFolder);
    
    // Préparer la réponse
    const response = {
      success: true,
      generated: new Date().toISOString(),
      folder: folder,
      totalFiles: files.length,
      files: files
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
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
