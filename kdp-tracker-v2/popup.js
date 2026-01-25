const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔄 Préparation de la connexion...');

    try {
        // 1. On cherche l'onglet KDP
        const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        if (!tabs || tabs.length === 0) {
            throw new Error("Ouvrez l'onglet KDP Reports (kdpreports.amazon.com)");
        }
        const tab = tabs[0];

        updateStatus('🔑 Récupération du jeton de sécurité...');

        // 2. On injecte un script pour récupérer le CSRF et les données
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                // Fonction pour lire un cookie spécifique
                const getCookie = (name) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(';').shift();
                };

                // On récupère le jeton CSRF d'Amazon (essentiel pour éviter l'erreur 400)
                const csrfToken = getCookie('csrf_token');

                try {
                    const response = await fetch(
                        "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL",
                        {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'csrf-token': csrfToken // On ajoute le jeton ici
                            }
                        }
                    );

                    if (response.status === 400) return { error: "Erreur 400 : Jeton de sécurité refusé. Rafraîchissez la page Amazon." };
                    if (!response.ok) return { error: `Erreur Amazon (${response.status})` };
                    
                    return await response.json();
                } catch (e) {
                    return { error: "Accès bloqué. Vérifiez votre connexion Amazon." };
                }
            }
        });

        const salesData = results[0].result;

        if (!salesData || salesData.error) {
            throw new Error(salesData ? salesData.error : "Erreur de lecture");
        }

        updateStatus('📤 Envoi au Dashboard...');

        // 3. Envoi au serveur local
        const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                payload: salesData
            })
        });

        if (!syncResponse.ok) throw new Error("Serveur backend éteint.");

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