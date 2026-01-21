// popup.js - VERSION ROBUSTE
const API_URL = 'http://localhost:3001';

function updateStatus(message, isError = false) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = isError ? 'status disconnected' : 'status connected';
}

// Fonction utilitaire pour détecter le marketplace principal dans les cookies
function detectMarketplaceFromCookies(cookies) {
  const domains = cookies.map(c => c.domain);
  if (domains.some(d => d.includes('.amazon.fr'))) return 'FR';
  if (domains.some(d => d.includes('.amazon.co.uk'))) return 'UK';
  if (domains.some(d => d.includes('.amazon.de'))) return 'DE';
  if (domains.some(d => d.includes('.amazon.ca'))) return 'CA';
  if (domains.some(d => d.includes('.amazon.com.au'))) return 'AU';
  return 'US'; // Par défaut
}

async function syncKDP() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email) {
    updateStatus('⚠️ Email requis', true);
    return;
  }

  updateStatus('🔄 1/3 Capture des cookies...', false);

  try {
    // 1. Demander les cookies au Background (Aspirateur)
    const response = await chrome.runtime.sendMessage({ action: 'getCookies' });

    console.log('Réponse du background:', response);

    if (!response || !response.success || !response.cookies || response.cookies.length === 0) {
      throw new Error('Aucun cookie trouvé. Êtes-vous connecté à Amazon ?');
    }

    const cookies = response.cookies;
    
    // 2. Détection intelligente du marketplace via les cookies
    const detectedMarketplace = detectMarketplaceFromCookies(cookies);
    console.log(`🌍 Marketplace détecté via cookies: ${detectedMarketplace} (Cookie count: ${cookies.length})`);

    updateStatus(`🔄 2/3 Envoi au serveur (${detectedMarketplace})...`);

    // 3. Envoi au Backend
    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: password || 'dummy',
        marketplace: detectedMarketplace,
        cookies: cookies
      })
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.error || 'Erreur serveur');
      } catch (e) {
        throw new Error(`Erreur serveur: ${syncResponse.statusText}`);
      }
    }

    const data = await syncResponse.json();
    console.log('✅ Succès Backend:', data);

    // 4. Sauvegarde locale
    await chrome.storage.local.set({
      lastSync: new Date().toISOString(),
      email,
      marketplace: detectedMarketplace
    });

    updateStatus('✅ Synchronisation réussie !');

  } catch (error) {
    console.error('Erreur Sync:', error);
    updateStatus(`❌ ${error.message}`, true);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get(['email', 'lastSync']);
  if (data.email) document.getElementById('email').value = data.email;
  
  if (data.lastSync) {
    const date = new Date(data.lastSync);
    document.getElementById('status').textContent = `Dernière sync: ${date.toLocaleTimeString()}`;
  }

  // IMPORTANT : Ajouter l'event listener pour le FORMULAIRE
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    syncKDP();
  });
});
