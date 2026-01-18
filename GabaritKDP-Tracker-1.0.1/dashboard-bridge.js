// dashboard-bridge.js
// Bridge between https://gabaritkdp.com and the extension, using window.postMessage.

(() => {
  const EXT_VERSION = chrome?.runtime?.getManifest?.().version || null;

  window.addEventListener('message', (event) => {
    if (!event || !event.data) return;
    const msg = event.data;

    // Only accept messages coming from the dashboard script
    if (msg.source !== 'gkdp-dashboard') return;

    // 1) Detection handshake
    if (msg.type === 'GKDP_EXTENSION_PING') {
      window.postMessage(
        {
          source: 'gkdp-extension',
          type: 'GKDP_EXTENSION_PONG',
          payload: { version: EXT_VERSION }
        },
        '*'
      );
      return;
    }

    // 2) Start sync from the dashboard
    if (msg.type === 'GKDP_START_SYNC') {
      // Tell dashboard we're starting
      window.postMessage(
        {
          source: 'gkdp-extension',
          type: 'GKDP_SYNC_STATUS',
          payload: { status: 'running', message: 'Sync started…' }
        },
        '*'
      );

      chrome.runtime.sendMessage({ type: 'GET_KDP_COOKIES' }, async (response) => {
        if (!response || !response.success) {
          window.postMessage(
            {
              source: 'gkdp-extension',
              type: 'GKDP_SYNC_STATUS',
              payload: { status: 'error', message: 'Failed to read KDP session' }
            },
            '*'
          );
          return;
        }

        try {
          const res = await fetch('https://gabaritkdp.com/api/kdp-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cookies: response.data })
          });

          if (!res.ok) throw new Error('Sync failed');

          window.postMessage(
            {
              source: 'gkdp-extension',
              type: 'GKDP_SYNC_STATUS',
              payload: { status: 'success', message: 'Sync completed successfully' }
            },
            '*'
          );
        } catch (e) {
          window.postMessage(
            {
              source: 'gkdp-extension',
              type: 'GKDP_SYNC_STATUS',
              payload: { status: 'error', message: 'Sync error' }
            },
            '*'
          );
        }
      });
    }
  });
})();
