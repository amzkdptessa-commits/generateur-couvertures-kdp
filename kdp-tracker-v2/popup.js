const API_URL = "http://127.0.0.1:3001";

function updateStatus(msg, isError = false) {
  const s = document.getElementById("status");
  s.textContent = msg;
  s.style.color = isError ? "#ff4c4c" : "#4cff4c";
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getOrOpenKdpTab() {
  // 1) Cherche un onglet kdpreports, même non actif
  const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
  if (tabs && tabs.length > 0) return tabs[0];

  // 2) Sinon, ouvre KDP Reports
  updateStatus("🌐 Ouverture de KDP Reports…");
  const tab = await chrome.tabs.create({
    url: "https://kdpreports.amazon.com/reports/dashboard",
    active: true
  });

  // 3) Attend chargement
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
  const email = document.getElementById("email").value?.trim();
  const btn = document.getElementById("btnSync");

  if (!email) {
    updateStatus("❌ Email manquant.", true);
    return;
  }

  btn.disabled = true;
  btn.textContent = "⏳ Synchronisation…";

  try {
    updateStatus("🔄 Préparation…");

    // Onglet KDP
    const tab = await getOrOpenKdpTab();

    // ✅ Rendre l'onglet KDP actif temporairement
    // (permet l'injection via activeTab sans erreur de permission)
    const [currentActive] = await chrome.tabs.query({ active: true, currentWindow: true });
    const previousTabId = currentActive?.id;

    await chrome.tabs.update(tab.id, { active: true });
    if (tab.windowId) await chrome.windows.update(tab.windowId, { focused: true });
    await sleep(450);

    updateStatus("📊 Récupération des données Amazon…");

    // Injection d’un fetch dans la page KDP
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        try {
          // Endpoint “direct” (peut varier selon Amazon)
          const url = "https://kdpreports.amazon.com/api/reports/dashboard?period=past12months&marketplace=ALL";
          const response = await fetch(url, { credentials: "include" });

          if (!response.ok) {
            return { ok: false, error: `Amazon API ${response.status} (session expirée ou endpoint changé)` };
          }

          const data = await response.json();
          return { ok: true, data };
        } catch (e) {
          return { ok: false, error: "Erreur fetch Amazon: " + (e?.message || String(e)) };
        }
      }
    });

    // Revenir à l’onglet précédent (confort)
    if (previousTabId && previousTabId !== tab.id) {
      await chrome.tabs.update(previousTabId, { active: true });
    }

    const res = results?.[0]?.result;
    if (!res?.ok) {
      // Message clair si Amazon bloque l’endpoint
      throw new Error(res?.error || "Impossible de récupérer les données Amazon.");
    }

    updateStatus("📤 Envoi au backend…");

    // Envoi au backend local (ton Playwright/collector)
    const syncResponse = await fetch(`${API_URL}/api/sync-kdp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        payload: res.data
      })
    });

    if (!syncResponse.ok) {
      throw new Error("Le backend est indisponible (Port 3001). Lance le serveur.");
    }

    updateStatus("✅ Synchronisation réussie !");
  } catch (error) {
    console.error("Erreur:", error);

    const msg = String(error?.message || error);

    if (msg.includes("Cannot access contents of the page")) {
      updateStatus("❌ Permissions Chrome. Va sur chrome://extensions puis Reload l’extension.", true);
    } else {
      updateStatus(`❌ ${msg}`, true);
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "🔗 Synchronize with KDP";
  }
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  syncKDP();
});
