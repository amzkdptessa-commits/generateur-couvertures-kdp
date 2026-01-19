// background.js (v1.0.5) - cookies via URL (fix CSRF)

const DEFAULT_API_URL = "http://localhost:3000";

function broadcastToDashboard(payload) {
  chrome.tabs.query({ url: ["https://gabaritkdp.com/*"] }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type: "SYNC_STATUS_UPDATE", payload });
    }
  });
}

function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["GKDP_API_URL"], (result) => {
      resolve(result.GKDP_API_URL || DEFAULT_API_URL);
    });
  });
}

function getKdpReportsCookies() {
  return new Promise((resolve) => {
    // IMPORTANT: utiliser url au lieu de domain (plus fiable)
    chrome.cookies.getAll({ url: "https://kdpreports.amazon.com/" }, (cookies) => {
      cookies = cookies || [];

      // Log safe: noms seulement
      console.log("[GKDP] Cookies kdpreports count:", cookies.length);
      console.log("[GKDP] Cookie names:", cookies.map(c => c.name));

      // Best-effort CSRF: plusieurs noms possibles selon comptes / régions
      const csrfCookie =
        cookies.find(c => c.name === "csrf-token") ||
        cookies.find(c => c.name === "csrfToken") ||
        cookies.find(c => c.name === "csrf") ||
        cookies.find(c => c.name === "x-csrf-token") ||
        null;

      resolve({
        cookies,
        csrfToken: csrfCookie ? csrfCookie.value : null
      });
    });
  });
}

async function syncWithBackend({ email, password, marketplace = "US", year, month }) {
  const apiUrl = await getApiUrl();
  const { cookies, csrfToken } = await getKdpReportsCookies();

  if (!cookies || cookies.length === 0) {
    throw new Error("Aucun cookie kdpreports.amazon.com trouvé. Connectez-vous à KDP Reports.");
  }

  const body = {
    email,
    password,
    cookies,
    csrfToken,
    marketplace
  };
  if (year) body.year = year;
  if (month) body.month = month;

  const res = await fetch(`${apiUrl}/api/sync-kdp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Backend error: ${res.status} ${txt}`);
  }

  return res.json();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_KDP_COOKIES") {
    getKdpReportsCookies()
      .then(({ cookies, csrfToken }) => {
        if (cookies.length > 0) {
          sendResponse({ success: true, cookies, csrfToken });
        } else {
          sendResponse({ success: false, message: "Aucun cookie KDP Reports. Connectez-vous d'abord." });
        }
      })
      .catch((e) => sendResponse({ success: false, message: e.message }));
    return true;
  }

  if (message.type === "START_SYNC_FROM_DASHBOARD") {
    const p = message.payload || {};
    const email = p.email || "";
    const password = p.password || "";
    const marketplace = p.marketplace || "US";
    const year = p.year;
    const month = p.month;

    if (!email || !password) {
      broadcastToDashboard({ level: "error", message: "Email/mot de passe manquants (dashboard)." });
      sendResponse({ success: false });
      return true;
    }

    broadcastToDashboard({ level: "info", message: "Récupération cookies KDP Reports..." });

    syncWithBackend({ email, password, marketplace, year, month })
      .then((result) => {
        broadcastToDashboard({ level: "success", message: "Synchronisation réussie !" });
        sendResponse({ success: true, result });
      })
      .catch((err) => {
        broadcastToDashboard({ level: "error", message: `Erreur sync: ${err.message}` });
        sendResponse({ success: false, error: err.message });
      });

    return true;
  }
});
