// page-sniffer.js (Main World)
(function () {
  const MAX_PAYLOAD_CHARS = 250_000; // sécurité (évite d'envoyer 10MB)
  const FLUSH_EVERY_MS = 1200;       // batch pour réduire les inserts
  const DEDUPE_TTL_MS = 2 * 60 * 1000;

  // Whitelist URLs (MVP)
  const ALLOW_PATTERNS = [
    "/reports/dashboard/overview",
    "/reports/dashboard/marketplaceDistributionOverview",
    "/reports/dashboard/formatDistributionOverview",
    "/reports/dashboard/topEarningTitles",
    "/reports/dashboard/histogramOverview/ORDERS",
    "/reports/mtd/DIGITAL",
    "/reports/mtd/KENP",
    "/metadata/customer/accountInfo",
    "/api/v2/reports/customerPreferences",
    "/api/v2/reports/reportingViewPreferences"
  ];

  function shouldCaptureUrl(url) {
    try {
      if (!url) return false;
      if (!String(url).includes("kdpreports.amazon.com")) return false;
      return ALLOW_PATTERNS.some(p => url.includes(p));
    } catch {
      return false;
    }
  }

  // Heuristique JSON : couvre tes structures réelles
  function looksLikeKdpData(obj) {
    if (!obj || typeof obj !== "object") return false;

    // cas 1: overviewWidget (ton exemple)
    if (obj.overviewWidget && typeof obj.overviewWidget === "object") return true;

    // cas 2: totalRoyalties direct ou imbriqué
    if (obj.totalRoyalties !== undefined) return true;
    if (obj.totalRoyalty !== undefined) return true;

    // cas 3: structures MTD/KENP
    if (obj.kenpRead !== undefined || obj.kenp_read !== undefined) return true;

    // cas 4: histogram / distribution
    if (obj.series && Array.isArray(obj.series)) return true;
    if (obj.data && (Array.isArray(obj.data) || typeof obj.data === "object")) return true;

    // cas 5: payloads typiques Amazon (listes)
    if (obj.entries && Array.isArray(obj.entries)) return true;

    return false;
  }

  // Dédoublonnage (url + "signature")
  const seen = new Map(); // key -> ts
  function cleanupSeen() {
    const now = Date.now();
    for (const [k, ts] of seen.entries()) {
      if (now - ts > DEDUPE_TTL_MS) seen.delete(k);
    }
  }
  function signature(url, data) {
    // signature légère : url + quelques champs stables
    const a = [];
    if (data?.overviewWidget?.totalRoyalties !== undefined) a.push(String(data.overviewWidget.totalRoyalties));
    if (data?.overviewWidget?.kenpRead !== undefined) a.push(String(data.overviewWidget.kenpRead));
    if (data?.overviewWidget?.printOrders !== undefined) a.push(String(data.overviewWidget.printOrders));
    if (data?.overviewWidget?.digitalOrders !== undefined) a.push(String(data.overviewWidget.digitalOrders));
    return `${url}::${a.join("|")}`;
  }

  // Batch en mémoire
  let buffer = [];
  let flushTimer = null;

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      cleanupSeen();

      if (!buffer.length) return;

      // On envoie un batch d'événements à content.js
      window.postMessage({
        type: "GKDP_KDP_BATCH",
        payload: {
          ts: new Date().toISOString(),
          items: buffer
        }
      }, "*");

      buffer = [];
    }, FLUSH_EVERY_MS);
  }

  function pushCapture(url, data) {
    try {
      // limite de taille
      const raw = JSON.stringify(data);
      if (raw.length > MAX_PAYLOAD_CHARS) return;

      const sig = signature(url, data);
      if (seen.has(sig)) return;
      seen.set(sig, Date.now());

      buffer.push({ url, data });
      scheduleFlush();
    } catch {}
  }

  // ===== Patch fetch =====
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await originalFetch.apply(this, args);
    try {
      const url = String(args[0] || "");
      if (shouldCaptureUrl(url)) {
        const clone = res.clone();
        const ct = clone.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await clone.json();
          if (looksLikeKdpData(data)) {
            pushCapture(url, data);
          }
        }
      }
    } catch {}
    return res;
  };

  // ===== Patch XHR =====
  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__gkdp_url = url;
    return XHROpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      try {
        const url = String(this.__gkdp_url || "");
        if (!shouldCaptureUrl(url)) return;
        const ct = this.getResponseHeader("content-type") || "";
        if (!ct.includes("application/json")) return;
        const data = JSON.parse(this.responseText);
        if (looksLikeKdpData(data)) {
          pushCapture(url, data);
        }
      } catch {}
    });
    return XHRSend.apply(this, args);
  };

  // Petit log de confirmation (utile au debug)
  console.log("GKDP Sniffer: injected (fetch+XHR patched).");
})();
