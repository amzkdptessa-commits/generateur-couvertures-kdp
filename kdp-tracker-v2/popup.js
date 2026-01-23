const API_URL = 'http://127.0.0.1:3001';

function updateStatus(message, isError = false) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = isError ? 'status disconnected' : 'status connected';
  }
}

function detectMarketplaceFromCookies(cookies) {
  const domains = cookies.map(c => c.domain);
  if (domains.some(d => d.includes('.amazon.fr'))) return 'FR';
  if (domains.some(d => d.includes('.amazon.co.uk'))) return 'UK';
  if (domains.some(d => d.includes('.amazon.de'))) return 'DE';
  if (domains.some(d => d.includes('.amazon.ca'))) return 'CA';
  return 'US';
}

async function syncKDP() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email) {
    updateStatus('⚠️ Email requis', true);
    return;
  }

  updateStatus('🔄 Capture des cookies...');

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getCookies' });

    if (!response || !response.success || !response.cookies) {
      throw new Error('Connectez-vous à KDP d\'abord');
    }

    const cookies = response.cookies;
    const marketplace = detectMarketplaceFromCookies(cookies);

    updateStatus(`🔄 Envoi au serveur (Marketplace: ${marketplace})...`);

    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        marketplace,
        cookies: cookies
      })
    });

    if (!syncResponse.ok) {
      throw new Error(`Serveur injoignable (${syncResponse.status})`);
    }

    const result = await syncResponse.json();
    
    await chrome.storage.local.set({
      lastSync: new Date().toISOString(),
      email
    });

    updateStatus('✅ Synchronisation réussie !');

  } catch (error) {
    console.error('Erreur:', error);
    updateStatus(`❌ ${error.message}`, true);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get(['email', 'lastSync']);
  if (data.email) document.getElementById('email').value = data.email;
  
  if (data.lastSync) {
    const date = new Date(data.lastSync);
    document.getElementById('status').textContent = `Dernière sync: ${date.toLocaleTimeString()}`;
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    syncKDP();
  });
});