#!/usr/bin/env node
/**
 * Serveur local pour KDP Canva App avec headers CORS
 * Usage: node serve-kdp.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Headers CORS pour Canva
  res.setHeader('Access-Control-Allow-Origin', 'https://www.canva.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/kdp-canva-app.js' || req.url.startsWith('/kdp-canva-app.js?')) {
    try {
      const jsContent = fs.readFileSync('kdp-canva-app.js', 'utf8');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.writeHead(200);
      res.end(jsContent);
      console.log(`✅ Servi: ${req.url}`);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
      console.log(`❌ Erreur: ${error.message}`);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur KDP démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichier servi: kdp-canva-app.js`);
  console.log(`🔗 URL pour Canva: http://localhost:${PORT}/kdp-canva-app.js`);
  console.log(`💡 Ctrl+C pour arrêter`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} déjà utilisé. Essayez un autre port.`);
  } else {
    console.log(`❌ Erreur serveur: ${error.message}`);
  }
});
