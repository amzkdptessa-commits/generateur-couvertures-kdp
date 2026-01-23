const API_URL = 'http://127.0.0.1:3001';

async function syncKDP() {
    updateStatus('🔄 Connexion à Amazon KDP...');

    try {
        // On force l'appel à l'API Amazon avec la session active
        const amazonRes = await fetch("https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL", {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });

        const contentType = amazonRes.headers.get("content-type");
        if (!amazonRes.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error("Session Amazon expirée. Ouvre l'onglet KDP Reports et rafraîchis-le.");
        }

        const salesData = await amazonRes.json();
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