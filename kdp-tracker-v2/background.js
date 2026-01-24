// background.js - MV3 service worker (module)

/** URLs KDP Reports (les plus stables pour un MVP)
 * NOTE: Amazon peut changer ces endpoints. L'idée ici est: commencer par month_current + pmr.
 */
function buildKdpEndpoints() {
  const now = new Date();
  // format YYYY-MM-DDT00:00:00Z (comme tes logs)
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const dateZ = `${yyyy}-${mm}-${dd}T00:00:00Z`;
  const dateEnc = encodeURIComponent(dateZ);

  const base = "https://kdpreports.amazon.com";

  // Month current (dashboard)
  const month_current = [
    `${base}/metadata/customer/accountInfo`,
    `${base}/api/v2/reports/customerPreferences`,
    `${base}/api/v2/reports/reportingViewPreferences`,
    `${base}/reports/dashboard/overview?date=${dateEnc}&viewOption=YESTERDAY`,
    `${base}/reports/dashboard/marketplaceDistributionOverview?date=${dateEnc}`,
    `${base}/reports/dashboard/formatDistributionOverview?date=${dateEnc}`,
    `${base}/reports/dashboard/topEarningTitles?date=${dateEnc}&viewOption=TODAY`,
    `${base}/reports/dashboard/histogramOverview/ORDERS?date=${dateEnc}`,
  ];

  // PMR / MTD (ex: KENP + DIGITAL) - endpoints que tu vois déjà dans tes logs
  const pmr = [
    `${base}/reports/mtd/KENP`,
    `${base}/reports/mtd/DIGITAL`,
  ];

  return { month_current, pmr };
}

/** Assure qu'un onglet KDP Reports existe et est chargé */
async function ensureKdpTab() {
  const urlPrefix = "https://kdpreports.amazon.com/";
  const tabs = await chrome.tabs.query({ url: `${urlPrefix}*` });

  if (tabs.length) {
    // privilégie l'onglet actif si possible
    const active = tabs.find(t => t.active) || tabs[0];
    await chrome.tabs.update(active.id, { active: true });
    return active.id;
  }

  const created = await chrome.tabs.create({ url: `${urlPrefix}reports/dashboard` });
  return created.id;
}

/** Attend que l'onglet soit en status complete */
async function waitTabComplete(tabId, timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const tab = await chrome.tabs.get(tabId);
    if (tab.status === "complete") return true;
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error("Timeout: la page KDP Reports met trop longtemps à charger.");
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "accept": "application/json, text/plain, */*",
    },
  });

  // parfois Amazon renvoie HTML si pas auth → on détecte
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} sur ${url}`);
  }
  if (!ct.includes("application/json")) {
    // essai de parse quand même si c'est JSON sans header
    try { return JSON.parse(text); } catch {
      throw new Error("Réponse non-JSON (probablement non connecté).");
    }
  }
  return JSON.parse(text);
}

/** Insert dans Supabase via REST */
async function supabaseInsert({ supabaseUrl, supabaseKey, user_email, payload }) {
  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/kdp_reports`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify([{
      user_email,
      payload,
      created_at: new Date().toISOString()
    }])
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Supabase insert failed (${res.status}): ${text}`);
  }
  // representation retourne tableau
  try { return JSON.parse(text); } catch { return []; }
}

/** Run complet: open tab, fetch pages, push Supabase */
async function runSync({ user_email, supabaseUrl, supabaseKey }) {
  const tabId = await ensureKdpTab();
  await waitTabComplete(tabId);

  const endpoints = buildKdpEndpoints();

  const pages = {};
  const pageKeys = [];

  // helper to capture a page set
  async function capturePageSet(key, urls) {
    const payloads = {};
    for (const u of urls) {
      try {
        const json = await fetchJson(u);
        payloads[u] = json;
      } catch (e) {
        // on log l'erreur par URL, mais on continue (résilience)
        payloads[u] = { __error: (e?.message || String(e)) };
      }
    }
    pages[key] = { kind: "network_dump", urls, payloads };
    pageKeys.push(key);
  }

  await capturePageSet("month_current", endpoints.month_current);
  await capturePageSet("pmr", endpoints.pmr);

  const out = {
    version: "collector-ext-v1",
    captured_at: new Date().toISOString(),
    pages
  };

  await supabaseInsert({
    supabaseUrl,
    supabaseKey,
    user_email,
    payload: out
  });

  return { ok: true, pageKeys };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "GKDP_SYNC") return;

  runSync(msg.payload)
    .then(r => sendResponse(r))
    .catch(e => sendResponse({ ok: false, error: e?.message || String(e) }));

  return true; // async
});
