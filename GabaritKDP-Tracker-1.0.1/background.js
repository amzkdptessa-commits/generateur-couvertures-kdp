// background.js (Manifest V3 service worker)

const KDP_URLS = [
  'https://kdp.amazon.com',
  'https://kdp.amazon.co.uk',
  'https://kdp.amazon.de',
  'https://kdp.amazon.fr',
  'https://kdp.amazon.ca',
  'https://kdp.amazon.com.au',
  'https://kdpreports.amazon.com'
];

console.log('[GKDP] Service worker loaded');

// Log installation / update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[GKDP] onInstalled:', details);
});

// Utility: safe stringify for logs
function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// Read cookies for one URL
function getCookiesForUrl(url) {
  return new Promise((resolve) => {
    chrome.cookies.getAll({ url }, (cookies) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.warn('[GKDP] chrome.cookies.getAll lastError for', url, lastError.message);
        resolve({ url, cookies: [], count: 0, error: lastError.message });
        return;
      }
      resolve({ url, cookies: cookies || [], count: (cookies || []).length });
    });
  });
}

// Main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderInfo = {
    id: sender?.id,
    url: sender?.url,
    tabId: sender?.tab?.id
  };

  console.log('[GKDP] onMessage:', safeJson(message), 'sender:', safeJson(senderInfo));

  if (!message || !message.type) {
    sendResponse({ success: false, error: 'Missing message.type' });
    return; // sync response
  }

  if (message.type === 'GET_KDP_COOKIES') {
    (async () => {
      try {
        console.log('[GKDP] GET_KDP_COOKIES: start');

        const results = await Promise.all(KDP_URLS.map(getCookiesForUrl));

        // Log a compact summary (counts only)
        const summary = results.map((r) => ({ url: r.url, count: r.count, error: r.error || null }));
        console.log('[GKDP] GET_KDP_COOKIES: summary', safeJson(summary));

        // Optional: detect "all zero" situation
        const total = results.reduce((acc, r) => acc + (r.count || 0), 0);
        console.log('[GKDP] GET_KDP_COOKIES: total cookies =', total);

        sendResponse({
          success: true,
          data: results,
          meta: {
            totalCookies: total,
            perUrl: summary
          }
        });
      } catch (err) {
        console.error('[GKDP] GET_KDP_COOKIES: fatal error', err);
        sendResponse({
          success: false,
          error: err?.message || String(err)
        });
      }
    })();

    return true; // keep channel open for async sendResponse
  }

  // Unknown message types
  sendResponse({ success: false, error: `Unknown message.type: ${message.type}` });
});
