// content.js (isolated world) => inject page-sniffer.js into main world
(() => {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("page-sniffer.js");
  s.onload = () => s.remove();
  (document.head || document.documentElement).appendChild(s);

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "GKDP_KDP_BATCH") return;

    chrome.runtime.sendMessage({
      type: "GKDP_CAPTURE_BATCH",
      payload: event.data.payload
    });
  });
})();
