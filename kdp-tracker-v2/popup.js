const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔄 Recherche de l\'onglet KDP...');

    try {
        // 1. On cherche TOUS les onglets qui correspondent à KDP Reports
        const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        
        if (!tabs || tabs.length === 0) {
            throw new Error("Onglet KDP non trouvé. Ouvrez https://kdpreports.amazon.com dans Chrome.");
        }

        // On prend le premier onglet trouvé
        const tab = tabs[0];
        updateStatus('📊 Extraction des ventes (12 mois)...');

        // 2. Injection du script pour récupérer les datas de l'API interne d'Amazon
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                try {
                    const response = await fetch("https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL");
                    if (!response.ok) return { error: "Session Amazon expirée ou accès refusé." };
                    return await response.json();
                } catch (e) {
                    return { error: "Erreur réseau Amazon : " + e.message };
                }
            }
        });

        const salesData = results[0].result;

        if (!salesData || salesData.error) {
            throw new Error(salesData ? salesData.error : "Impossible de lire les données.");
        }

        updateStatus('📤 Envoi au serveur...');

        // 3. Envoi au backend local
        const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                payload: salesData
            })
        });

        if (!syncResponse.ok) throw new Error("Serveur local injoignable (vérifiez Port 3001).");

        updateStatus('✅ Synchronisation réussie !');

    } catch (error) {
        console.error('Erreur détaillée:', error);
        updateStatus(`${error.message}`, true);
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