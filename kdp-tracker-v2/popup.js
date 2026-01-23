const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔄 Accès à l\'onglet Amazon...');

    try {
        // 1. Trouver l'onglet KDP ouvert
        const [tab] = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*", active: true });
        
        if (!tab) {
            throw new Error("Ouvre l'onglet KDP Reports et assure-toi qu'il est sélectionné.");
        }

        updateStatus('📊 Récupération des données Amazon (12 mois)...');

        // 2. Injecter un script dans la page Amazon pour récupérer le JSON de ventes
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                const response = await fetch("https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL");
                if (!response.ok) return { error: "Session expirée sur Amazon" };
                return await response.json();
            }
        });

        const salesData = results[0].result;

        if (salesData.error) throw new Error(salesData.error);

        updateStatus('📤 Envoi au Dashboard...');

        // 3. Envoyer le résultat au serveur local
        const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                payload: salesData
            })
        });

        if (!syncResponse.ok) throw new Error("Le serveur backend est éteint (Port 3001).");

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

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    syncKDP();
});