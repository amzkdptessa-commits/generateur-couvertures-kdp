// background.js (v1.0.4)

const DEFAULT_API_URL = "http://localhost:3000";

function broadcastToDashboard(payload) {
  chrome.tabs.query({ url: ["https://gabaritkdp.com/*"] }, (tabs) => {
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id, {
        type: "SYNC_STATUS_UPDATE",
        payload
      });
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
    chrome.cookies.getAll({ domain: "kdpreports.amazon.com" }, (cookiesReports) => {
      const cookies = cookiesReports || [];

      const csrfCookie =
        cookies.find((c) => c.name === "csrf-token") ||
        cookies.find((c) => c.name === "csrfToken") ||
        cookies.find((c) => c.name === "csrf");

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

  // Optionnel : synchro d'un mois précis
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
  // 1) Popup : récupérer cookies + csrf
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

    return true; // async
  }

  // 2) Dashboard : déclencher sync depuis gabaritkdp.com
  if (message.type === "START_SYNC_FROM_DASHBOARD") {
    const p = message.payload || {};

    // Payload attendu (au minimum email/password)
    const email = p.email || "";
    const password = p.password || "";
    const marketplace = p.marketplace || "US";
    const year = p.year;
    const month = p.month;

    if (!email || !password) {
      broadcastToDashboard({
        level: "error",
        message: "Email/mot de passe manquants (dashboard)."
      });
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

    return true; // async
  }
});
