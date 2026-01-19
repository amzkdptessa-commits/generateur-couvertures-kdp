// background.js (v1.0.6) - Orchestrate KDP in-browser fetch and ingest backend

const DEFAULT_API_URL = "http://localhost:3000";

function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["GKDP_API_URL"], (result) => {
      resolve(result.GKDP_API_URL || DEFAULT_API_URL);
    });
  });
}

function broadcastToDashboard(payload) {
  chrome.tabs.query({ url: ["https://gabaritkdp.com/*"] }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type: "SYNC_STATUS_UPDATE", payload });
    }
  });
}

function ensureKdpTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: ["https://kdpreports.amazon.com/*"] }, (tabs) => {
      if (tabs && tabs.length) return resolve(tabs[0]);
      chrome.tabs.create({ url: "https://kdpreports.amazon.com/pmr", active: true }, (tab) => resolve(tab));
    });
  });
}

function waitForTabComplete(tabId, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const listener = (updatedTabId, info) => {
      if (updatedTabId !== tabId) return;
      if (info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    const timer = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error("Timeout loading KDP tab"));
      }
    }, 500);
  });
}

async function ingestToBackend(payload) {
  const apiUrl = await getApiUrl();
  const res = await fetch(`${apiUrl}/api/ingest-kdp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Backend ingest error ${res.status}: ${txt}`);
  }
  return res.json();
}

async function runSync({ email, year, month }) {
  broadcastToDashboard({ level: "info", message: "Ouverture KDP Reports..." });

  const tab = await ensureKdpTab();
  await waitForTabComplete(tab.id);

  broadcastToDashboard({ level: "info", message: "Récupération des redevances KDP..." });

  const kdpResult = await chrome.tabs.sendMessage(tab.id, {
    type: "GKDP_KDP_SYNC",
    payload: { year, month }
  });

  if (!kdpResult || !kdpResult.success) {
    throw new Error(kdpResult?.error || "Échec fetch KDP (non connecté ?)");
  }

  broadcastToDashboard({ level: "info", message: "Envoi des données au serveur..." });

  const ingestResult = await ingestToBackend({
    email,
    source: "marketplaceOverview",
    range: kdpResult.range,
    raw: kdpResult.data
  });

  broadcastToDashboard({ level: "success", message: "Synchronisation terminée !" });
  return ingestResult;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_SYNC_FROM_DASHBOARD") {
    const p = message.payload || {};
    const email = p.email || "";
    const year = p.year;
    const month = p.month;

    if (!email) {
      broadcastToDashboard({ level: "error", message: "Email manquant (dashboard)." });
      sendResponse({ success: false });
      return true;
    }

    runSync({ email, year, month })
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => {
        broadcastToDashboard({ level: "error", message: `Erreur sync: ${err.message}` });
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
