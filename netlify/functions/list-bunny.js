// netlify/functions/list-bunny.js

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const path = event.queryStringParameters.path || '';
  const STORAGE_ZONE = 'gabaritkdp-images'; 
  const ACCESS_KEY = process.env.BUNNY_STORAGE_API_KEY; 
  const CDN_URL = 'https://gabaritkdp.b-cdn.net'; 

  try {
    // 🎯 LA CORRECTION EST ICI : on utilise encodeURI au lieu de encodeURIComponent
    // pour garder les "/" intacts dans l'adresse
    const bunnyUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURI(path)}/`;
    
    console.log("Appel Bunny vers :", bunnyUrl);

    const response = await fetch(bunnyUrl, {
      method: 'GET',
      headers: { 
        'AccessKey': ACCESS_KEY, 
        'Accept': 'application/json' 
      }
    });

    if (!response.ok) throw new Error(`Bunny API error: ${response.status}`);

    const data = await response.json();

    const result = data.map(item => {
      const isDir = item.IsDirectory;
      // Nettoyage du chemin pour éviter les doubles barres //
      const cleanPath = `${path}/${item.ObjectName}`.replace(/\/+/g, '/');
      
      return {
        name: item.ObjectName,
        isDir: isDir,
        path: cleanPath,
        url: isDir 
          ? `${CDN_URL}/${encodeURI(cleanPath)}/vignette.png` 
          : `${CDN_URL}/${encodeURI(path)}/${encodeURIComponent(item.ObjectName)}`
      };
    });

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Erreur:', error);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};