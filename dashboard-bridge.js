// dashboard-bridge.js

(() => {
  const EXT_VERSION = chrome.runtime.getManifest().version;

  // Répond au ping du dashboard (détection)
  window.addEventListener("message", (event) => {
    if (!event.data || event.data.source !== "gkdp-dashboard") return;

    if (event.data.type === "GKDP_EXTENSION_PING") {
      window.postMessage(
        {
          source: "gkdp-extension",
          type: "GKDP_EXTENSION_PONG",
          payload: { version: EXT_VERSION }
        },
        "*"
      );
    }

    // Lancement du sync depuis le dashboard
    if (event.data.type === "GKDP_START_SYNC") {
      chrome.runtime.sendMessage(
        { type: "GET_KDP_COOKIES" },
        async (response) => {
          if (!response || !response.success) {
            window.postMessage(
              {
                source: "gkdp-extension",
                type: "GKDP_SYNC_STATUS",
                payload: { status: "error", message: "Cannot read KDP cookies" }
              },
              "*"
            );
            return;
          }

          try {
            window.postMessage(
              {
                source: "gkdp-extension",
                type: "GKDP_SYNC_STATUS",
                payload: { status: "running", message: "Syncing with KDP…" }
              },
              "*"
            );

            const res = await fetch("https://gabaritkdp.com/api/kdp-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cookies: response.data })
            });

            if (!res.ok) throw new Error();

            window.postMessage(
              {
                source: "gkdp-extension",
                type: "GKDP_SYNC_STATUS",
                payload: { status: "success", message: "Sync completed" }
              },
              "*"
            );
          } catch (e) {
            window.postMessage(
              {
                source: "gkdp-extension",
                type: "GKDP_SYNC_STATUS",
                payload: { status: "error", message: "Sync failed" }
              },
              "*"
            );
          }
        }
      );
    }
  });
})();
