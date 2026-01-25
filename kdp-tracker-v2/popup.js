const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔍 Recherche du jeton Amazon...');

    try {
        const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        if (!tabs || tabs.length === 0) {
            throw new Error("Ouvrez l'onglet KDP Reports");
        }
        const tab = tabs[0];

        // Étape 1 : Injection du script pour extraire le jeton CSRF interne
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                // Technique 1 : Chercher dans les variables globales d'Amazon
                let token = window.csrfToken || 
                            (window.CSRF_CONFIG && window.CSRF_CONFIG.token) ||
                            (window.KDP && window.KDP.csrfToken);

                // Technique 2 : Chercher dans le code source de la page (regex)
                if (!token) {
                    const html = document.documentElement.innerHTML;
                    const match = html.match(/"csrfToken":"([^"]+)"/);
                    if (match) token = match[1];
                }

                // Technique 3 : Chercher dans les cookies (fallback)
                if (!token) {
                    token = document.cookie.split('; ')
                        .find(row => row.startsWith('csrf_token='))
                        ?.split('=')[1];
                }

                if (!token) return { error: "Jeton de sécurité introuvable. Rafraîchissez Amazon." };

                try {
                    // Appel à l'API Amazon avec le jeton trouvé
                    const response = await fetch(
                        "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL",
                        {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'X-CSRF-Token': token, // En-tête standard
                                'anti-csrftoken-a2z': token // En-tête spécifique Amazon
                            }
                        }
                    );

                    if (!response.ok) return { error: `Amazon a refusé l'accès (${response.status})` };
                    
                    return await response.json();
                } catch (e) {
                    return { error: "Erreur lors de l'aspiration des données." };
                }
            }
        });

        const salesData = results[0].result;

        if (!salesData || salesData.error) {
            throw new Error(salesData ? salesData.error : "Données vides");
        }

        updateStatus('📤 Envoi au Dashboard...');

        // Étape 2 : Envoi au serveur local
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