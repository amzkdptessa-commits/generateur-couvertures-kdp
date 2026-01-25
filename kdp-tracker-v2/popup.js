const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🚀 Initialisation du scan...');

    try {
        const [tab] = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
        if (!tab) throw new Error("Ouvrez l'onglet KDP Reports");

        updateStatus('📊 Lecture des chiffres sur l\'écran...');

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // On va chercher les chiffres directement dans le texte de la page
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText.trim() : "0";
                };

                // On essaie de récupérer les 3 KPIs principaux affichés
                // Les sélecteurs ci-dessous correspondent aux classes standards de KDP
                const royalties = document.evaluate("//div[contains(text(), 'estimées')]/following-sibling::div", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerText || 
                                 document.querySelector('.dashboard-kpi-value')?.innerText || "0";
                
                const orders = document.evaluate("//div[contains(text(), 'Commandes')]/following-sibling::div", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerText || "0";
                
                const kenp = document.evaluate("//div[contains(text(), 'KENP')]/following-sibling::div", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerText || "0";

                return {
                    overview: {
                        totalRoyalties: royalties,
                        totalOrders: orders,
                        totalKenp: kenp
                    },
                    scrapedAt: new Date().toISOString(),
                    source: "DOM_Scraping"
                };
            }
        });

        // Correction de l'erreur "null"
        if (!results || !results[0] || !results[0].result) {
            throw new Error("Impossible de lire la page. Rafraîchissez Amazon.");
        }

        const salesData = results[0].result;
        updateStatus('📤 Envoi au Dashboard...');

        await fetch(`${API_URL}/api/sync-kdp`, {
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