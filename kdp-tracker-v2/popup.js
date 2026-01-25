const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔐 Récupération de la session...');

    try {
        // 1. Récupérer l'onglet
        const [tab] = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        if (!tab) throw new Error("Ouvrez l'onglet KDP Reports");

        // 2. Récupérer les cookies de session "cachés"
        const cookies = await chrome.cookies.getAll({ domain: "amazon.com" });
        const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        updateStatus('📊 Aspiration des données...');

        // 3. Exécuter le fetch avec les pleins pouvoirs
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async () => {
                // On cherche le token CSRF dans les scripts de la page
                const html = document.documentElement.innerHTML;
                const csrfMatch = html.match(/"csrfToken":"([^"]+)"/);
                const csrfToken = csrfMatch ? csrfMatch[1] : null;

                const response = await fetch(
                    "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL",
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'csrf-token': csrfToken
                        }
                    }
                );

                if (response.status === 403 || response.status === 401) {
                    throw new Error("Amazon bloque l'accès (403).");
                }

                return await response.json();
            }
        });

        const salesData = results[0].result;
        if (!salesData || salesData.error) throw new Error(salesData.error || "Erreur de données");

        updateStatus('📤 Envoi au Dashboard...');

        const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                payload: salesData
            })
        });

        updateStatus('✅ Synchronisation réussie !');

    } catch (error) {
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