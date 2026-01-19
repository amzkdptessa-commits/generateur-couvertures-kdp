const API_URL = 'http://localhost:3000';

document.getElementById('sync-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const status = document.getElementById('status');

  if (!email || !password) {
    status.textContent = 'Veuillez remplir les champs';
    return;
  }

  status.textContent = 'Récupération des cookies...';

  chrome.runtime.sendMessage({ type: 'GET_KDP_COOKIES' }, async response => {
    if (response && response.success) {
      status.textContent = 'Envoi au serveur...';
      try {
        const res = await fetch(`${API_URL}/api/sync-kdp`, { // URL CORRIGÉE
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            password, 
            cookies: response.data[0].cookies, // On prend les cookies du premier domaine KDP
            marketplace: 'US' 
          })
        });
        const result = await res.json();
        status.textContent = result.message || 'Synchronisation terminée !';
      } catch (e) {
        status.textContent = 'Erreur de connexion au serveur';
      }
    } else {
      status.textContent = 'Connectez-vous à KDP d\'abord';
    }
  });
});