const API_URL = "http://127.0.0.1:3001";

async function getOrOpenKdpTab() {
  // 1) Cherche n'importe quel onglet kdpreports (même non actif)
  const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
  if (tabs && tabs.length > 0) return tabs[0];

  // 2) Sinon, ouvre un nouvel onglet kdpreports
  updateStatus("🌐 Ouverture de KDP Reports…");
  const tab = await chrome.tabs.create({ url: "https://kdpreports.amazon.com/reports/dashboard", active: true });

  // 3) Attend qu'il soit chargé
  await new Promise((resolve) => {
    const listener = (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });

  return tab;
}

async function syncKDP() {
  updateStatus("🔄 Préparation…");

  try {
    // ✅ On n'exige plus que l'onglet soit sélectionné
    const tab = await getOrOpenKdpTab();

    updateStatus("📊 Récupération des données Amazon…");

    // ⚠️ On tente d'abord l'endpoint historique (si Amazon le bloque, on renverra une erreur claire)
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          const url = "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL";
          const response = await fetch(url, { credentials: "include" });
          if (!response.ok) {
            return { error: `Amazon API ${response.status} (session expirée ou endpoint changé)` };
          }
          const data = await response.json();
          return { ok: true, data };
        } catch (e) {
          return { error: "Erreur fetch Amazon: " + (e?.message || String(e)) };
        }
      }
    });

    const res = results?.[0]?.result;
    if (!res || res.error) throw new Error(res?.error || "Impossible de récupérer les données Amazon.");

    updateStatus("📤 Envoi au backend…");

    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        payload: res.data
      })
    });

    if (!syncResponse.ok) throw new Error("Le serveur backend est éteint (Port 3001).");

    updateStatus("✅ Synchronisation réussie !");
  } catch (error) {
    console.error("Erreur:", error);
    updateStatus(`❌ ${error.message}`, true);
  }
}

function updateStatus(msg, isError = false) {
  const s = document.getElementById("status");
  s.textContent = msg;
  s.style.color = isError ? "#ff4c4c" : "#4cff4c";
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  syncKDP();
});
