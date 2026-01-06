// api/list-files.js (Pour Vercel)
const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { path = '' } = req.query;
  const STORAGE_ZONE = 'gabaritkdp-images'; 
  const ACCESS_KEY = process.env.BUNNY_STORAGE_API_KEY; // À régler dans le tableau de bord Vercel
  const CDN_URL = 'https://cdn.gabaritkdp.com'; 

  try {
    const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(path)}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'AccessKey': ACCESS_KEY,
        'Accept': 'application/json' 
      }
    });

    const data = await response.json();

    const formattedData = data.map(item => ({
      name: item.ObjectName,
      isDir: item.IsDirectory,
      url: item.IsDirectory 
           ? `${CDN_URL}/${path}/${item.ObjectName}/vignette.png` 
           : `${CDN_URL}/${path}/${item.ObjectName}`,
      path: `${path}/${item.ObjectName}`.replace(/\/+/g, '/')
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}