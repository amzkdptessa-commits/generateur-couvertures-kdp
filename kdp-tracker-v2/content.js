// kdp-content.js (v1.0.6) - Execute marketplaceOverview from inside KDP context

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchMarketplaceOverview({ startISO, endISO }) {
  const url =
    `https://kdpreports.amazon.com/reports/pmr/print/marketplaceOverview` +
    `?startDate=${encodeURIComponent(startISO)}` +
    `&endDate=${encodeURIComponent(endISO)}` +
    `&shouldShowCreateSpace=false`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "x-requested-with": "XMLHttpRequest"
      // Pas besoin de x-csrf-token ici : le navigateur a le contexte / tokens nécessaires
    }
  });

  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = { raw: txt }; }

  if (!res.ok) {
    throw new Error(`KDP responded ${res.status}: ${typeof data === "string" ? data : (data?.message || "error")}`);
  }
  return data;
}

function computeTargetMonth(year, month) {
  const now = new Date();
  const y = Number.isFinite(+year) ? +year : now.getUTCFullYear();
  const m = Number.isFinite(+month) ? +month : (now.getUTCMonth() + 1);

  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59));

  return {
    startISO: start.toISOString().replace(".000Z", "Z"),
    endISO: end.toISOString().replace(".000Z", "Z"),
    y, m
  };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "GKDP_KDP_SYNC") return;

  (async () => {
    try {
      // petit délai pour laisser la page finir de charger (SPA)
      await sleep(500);

      const { year, month } = msg.payload || {};
      const range = computeTargetMonth(year, month);

      const data = await fetchMarketplaceOverview(range);

      sendResponse({
        success: true,
        range,
        data
      });
    } catch (e) {
      sendResponse({
        success: false,
        error: e.message
      });
    }
  })();

  return true;
});
