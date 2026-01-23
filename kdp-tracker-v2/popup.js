const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
  updateStatus('🔄 Récupération des données Amazon...');

  try {
    // 1. L'extension appelle directement l'API Amazon (elle utilise TA session active)
    const amazonRes = await fetch("https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL");
    
    if (!amazonRes.ok) throw new Error("Session Amazon expirée. Re-connecte-toi.");
    
    const salesData = await amazonRes.json();
    console.log("Données aspirées :", salesData);

    updateStatus('📤 Envoi au Dashboard...');

    // 2. Elle envoie ces données TOUTES PRÊTES à ton serveur
    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        payload: salesData // On envoie le JSON complet ici
      })
    });

    if (!syncResponse.ok) throw new Error("Le serveur backend est éteint.");

    updateStatus('✅ Synchronisation réussie !');

  } catch (error) {
    console.error('Erreur:', error);
    updateStatus(`❌ ${error.message}`, true);
  }
}

function updateStatus(msg, isError = false) {
  const s = document.getElementById('status');
  s.textContent = msg;
  s.style.color = isError ? "#ff4c4c" : "#4cff4c";
}

document.getElementById('loginForm').addEventListener('submit', (e) => { e.preventDefault(); syncKDP(); });