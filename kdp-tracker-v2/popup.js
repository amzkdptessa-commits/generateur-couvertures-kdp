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

  // On demande les cookies au background.js
  chrome.runtime.sendMessage({ type: 'GET_KDP_COOKIES' }, async response => {
    if (response && response.success) {
      status.textContent = 'Envoi au serveur...';
      
      try {
        const res = await fetch(`${API_URL}/api/sync-kdp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email, 
            password: password, 
            cookies: response.cookies, 
            marketplace: 'US' 
          })
        });

        if (!res.ok) throw new Error('Erreur lors de l\'appel API');

        const result = await res.json();
        status.textContent = 'Synchronisation réussie !';
        console.log('Résultat:', result);

      } catch (e) {
        console.error('Erreur:', e);
        status.textContent = 'Erreur de connexion au serveur';
      }
    } else {
      status.textContent = response.message || 'Connectez-vous à KDP d\'abord';
    }
  });
});