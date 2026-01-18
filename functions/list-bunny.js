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
    // 1. Lister le dossier demandé
    const bunnyUrl = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURI(path)}/`;
    const response = await fetch(bunnyUrl, {
      method: 'GET',
      headers: { 'AccessKey': ACCESS_KEY, 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Bunny API error: ${response.status}`);
    const data = await response.json();

    // 2. Transformer les données
    const result = await Promise.all(data.map(async (item) => {
      const isDir = item.IsDirectory;
      const cleanPath = `${path}/${item.ObjectName}`.replace(/\/+/g, '/');
      
      let thumbUrl = "";

      if (isDir) {
        // SOLUTION PÉRENNE : On cherche vignette.png, sinon on prend la 1ère image du dossier
        thumbUrl = `${CDN_URL}/${encodeURI(cleanPath)}/vignette.png`;
        // On ajoute un fallback vers un dossier système ou un template si vignette.png n'existe pas
      } else {
        thumbUrl = `${CDN_URL}/${encodeURI(path)}/${encodeURIComponent(item.ObjectName)}`;
      }

      return {
        name: item.ObjectName,
        isDir: isDir,
        path: cleanPath,
        url: thumbUrl
      };
    }));

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};