// Netlify Function: netlify/functions/list-bunny-files.js
// Cette fonction liste les fichiers d'un dossier Bunny CDN de manière sécurisée

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Récupérer le paramètre 'path' depuis l'URL
    const path = event.queryStringParameters?.path || '';
    
    if (!path) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing path parameter' })
      };
    }

    console.log('📂 Listing files for path:', path);

    // Configuration Bunny CDN
    const STORAGE_ZONE = 'gabaritkdp';
    const STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY; // À définir dans Netlify
    const BUNNY_API_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(path)}/`;

    // Appel API à Bunny CDN
    const response = await fetch(BUNNY_API_URL, {
      method: 'GET',
      headers: {
        'AccessKey': STORAGE_API_KEY
      }
    });

    if (!response.ok) {
      console.error('❌ Bunny API Error:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Bunny API Error: ${response.status}`,
          path: path
        })
      };
    }

    const files = await response.json();
    
    // Filtrer seulement les images
    const imageFiles = files
      .filter(file => 
        !file.IsDirectory && 
        /\.(jpg|jpeg|png|webp)$/i.test(file.ObjectName)
      )
      .map(file => ({
        name: file.ObjectName,
        size: file.Length,
        lastModified: file.LastChanged,
        // Construire l'URL publique du CDN (pas l'API Storage)
        url: `https://gabaritkdp.b-cdn.net/${path}/${encodeURIComponent(file.ObjectName)}`
      }));

    console.log(`✅ Found ${imageFiles.length} images in ${path}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        path: path,
        count: imageFiles.length,
        files: imageFiles
      })
    };

  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
