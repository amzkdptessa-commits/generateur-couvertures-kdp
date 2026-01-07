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
    const bunnyUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURI(path)}/`;
    const response = await fetch(bunnyUrl, {
      method: 'GET',
      headers: { 'AccessKey': ACCESS_KEY, 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();

    const result = data.map(item => {
      const isDir = item.IsDirectory;
      const cleanPath = `${path}/${item.ObjectName}`.replace(/\/+/g, '/');
      
      // On encode proprement chaque partie de l'URL pour Bunny
      const encodedPath = cleanPath.split('/').map(p => encodeURIComponent(p)).join('/');
      const parentPath = path.split('/').map(p => encodeURIComponent(p)).join('/');

      return {
        name: item.ObjectName,
        isDir: isDir,
        path: cleanPath,
        // On ajoute un petit numéro à la fin (?v=123) pour vider le cache
        url: isDir 
          ? `${CDN_URL}/${encodedPath}/vignette.png?v=${Date.now()}` 
          : `${CDN_URL}/${parentPath}/${encodeURIComponent(item.ObjectName)}`
      };
    });

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};