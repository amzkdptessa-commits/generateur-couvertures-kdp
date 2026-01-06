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
  const CDN_URL = 'https://gabaritkdp.b-cdn.net'; // On utilise l'URL par défaut de Bunny pour être sûr

  try {
    // Utilisation du fetch natif de Node.js (pas besoin de require)
    const response = await fetch(`https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(path)}/`, {
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
      const cleanPath = `${path}/${item.ObjectName}`.replace(/\/+/g, '/');
      
      return {
        name: item.ObjectName,
        isDir: isDir,
        path: cleanPath,
        url: isDir 
          ? `${CDN_URL}/${cleanPath}/vignette.png` 
          : `${CDN_URL}/${path}/${item.ObjectName}`
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