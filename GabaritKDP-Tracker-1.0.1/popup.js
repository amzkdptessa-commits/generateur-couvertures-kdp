const API_URL = 'https://gabaritkdp.com';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[GKDP] popup.js loaded');

  const syncBtn = document.getElementById('sync-btn');
  const status = document.getElementById('status');

  const setStatus = (msg) => {
    status.textContent = msg;
    console.log('[GKDP] STATUS:', msg);
  };

  syncBtn.addEventListener('click', async () => {
    setStatus('Synchronizing…');

    chrome.runtime.sendMessage({ type: 'GET_KDP_COOKIES' }, async (response) => {
      console.log('[GKDP] GET_KDP_COOKIES response:', response);

      if (!response || !response.success) {
        setStatus('Failed to read KDP session (cookies)');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/kdp-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies: response.data })
        });

        const text = await res.text().catch(() => '');
        console.log('[GKDP] /api/kdp-sync status:', res.status, text);

        if (!res.ok) {
          setStatus(`Sync failed (${res.status}) ${text.slice(0, 140)}`);
          return;
        }

        setStatus('Sync completed successfully');
      } catch (e) {
        console.error('[GKDP] fetch error:', e);
        setStatus(`Sync error: ${e?.message || 'unknown'}`);
      }
    });
  });
});
