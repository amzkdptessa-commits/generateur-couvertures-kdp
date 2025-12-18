// popup.js - CORRIGÉ pour Manifest V3
// Les cookies doivent être capturés par le service worker, pas par la popup

const API_URL = 'http://localhost:3000';

// Détecte le marketplace depuis l'URL
function getMarketplaceFromUrl(url) {
  if (url.includes('amazon.com/')) return 'US';
  if (url.includes('amazon.co.uk/')) return 'UK';
  if (url.includes('amazon.de/')) return 'DE';
  if (url.includes('amazon.fr/')) return 'FR';
  if (url.includes('amazon.ca/')) return 'CA';
  if (url.includes('amazon.com.au/')) return 'AU';
  return 'US';
}

// Mise à jour du statut
function updateStatus(message, isError = false) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = isError ? 'error' : 'success';
}

// Synchronisation KDP
async function syncKDP() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    updateStatus('⚠️ Email et mot de passe requis', true);
    return;
  }

  updateStatus('🔄 Synchronisation en cours...');

  try {
    // 1. Obtenir l'onglet actif
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('Aucun onglet actif trouvé');
    }

    const marketplace = getMarketplaceFromUrl(tab.url);
    console.log('Marketplace détecté:', marketplace);

    // 2. DEMANDER AU SERVICE WORKER DE CAPTURER LES COOKIES
    console.log('Envoi du message au service worker...');
    
    const response = await chrome.runtime.sendMessage({
      action: 'getCookies',
      marketplace: marketplace
    });

    console.log('Réponse du service worker:', response);

    if (!response || !response.cookies) {
      throw new Error('Impossible de récupérer les cookies depuis le service worker');
    }

    const cookies = response.cookies;
    console.log(`✅ ${cookies.length} cookies reçus du service worker`);

    // 3. Envoyer au backend
    console.log('Envoi au backend...');
    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        marketplace,
        cookies
      })
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      throw new Error(errorData.message || 'Erreur serveur');
    }

    const data = await syncResponse.json();
    console.log('Réponse backend:', data);

    // 4. Sauvegarder localement
    await chrome.storage.local.set({
      lastSync: new Date().toISOString(),
      email,
      marketplace
    });

    updateStatus('✅ Synchronisation réussie !');

  } catch (error) {
    console.error('Erreur sync:', error);
    updateStatus(`❌ Erreur: ${error.message}`, true);
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  // Charger les données sauvegardées
  const data = await chrome.storage.local.get(['email', 'lastSync']);
  
  if (data.email) {
    document.getElementById('email').value = data.email;
  }

  if (data.lastSync) {
    const lastSyncDate = new Date(data.lastSync);
    updateStatus(`Dernière sync: ${lastSyncDate.toLocaleString('fr-FR')}`);
  } else {
    updateStatus('⚠️ Non connecté');
  }

  // Bouton de synchronisation
  document.getElementById('syncButton').addEventListener('click', syncKDP);
});
