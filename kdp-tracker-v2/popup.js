const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🚀 Initialisation...');

    try {
        const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        if (!tabs || tabs.length === 0) {
            throw new Error("Ouvrez l'onglet KDP Reports");
        }
        const tab = tabs[0];

        updateStatus('📊 Aspiration des données en cours...');

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                // Fonction de secours pour trouver n'importe quel jeton de sécurité sur la page
                const findToken = () => {
                    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('csrf_token='))?.split('=')[1];
                    if (cookieToken) return cookieToken;
                    
                    const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
                    if (metaToken) return metaToken;

                    const scriptToken = document.documentElement.innerHTML.match(/"csrfToken":"([^"]+)"/)?.[1];
                    return scriptToken;
                };

                const token = findToken();

                try {
                    // On tente la requête avec et sans jeton (Amazon accepte parfois l'un ou l'autre selon la session)
                    const headers = { 'Accept': 'application/json' };
                    if (token) {
                        headers['csrf-token'] = token;
                        headers['anti-csrftoken-a2z'] = token;
                    }

                    const response = await fetch(
                        "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL",
                        { method: 'GET', headers: headers }
                    );

                    if (!response.ok) {
                        // Si l'API échoue, on tente une méthode alternative en "mimant" un clic utilisateur
                        throw new Error(`Erreur Amazon ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (e) {
                    return { error: "Amazon bloque l'accès. Essayez de rafraîchir la page Amazon puis relancez." };
                }
            }
        });

        const salesData = results[0].result;

        if (!salesData || salesData.error) {
            throw new Error(salesData ? salesData.error : "Impossible de lire les données.");
        }

        updateStatus('📤 Envoi au Dashboard...');

        const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                payload: salesData
            })
        });

        if (!syncResponse.ok) throw new Error("Le serveur backend est éteint.");

        updateStatus('✅ Synchronisation réussie !');

    } catch (error) {
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