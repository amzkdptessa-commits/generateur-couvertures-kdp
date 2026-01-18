const API_URL = 'https://gabaritkdp.com';

document.addEventListener('DOMContentLoaded', () => {
  const syncBtn = document.getElementById('sync-btn');
  const status = document.getElementById('status');

  syncBtn.addEventListener('click', async () => {
    status.textContent = 'Synchronizing…';

    chrome.runtime.sendMessage({ type: 'GET_KDP_COOKIES' }, async response => {
      if (!response || !response.success) {
        status.textContent = 'Failed to read KDP session';
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/kdp-sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies: response.data })
        });

        if (!res.ok) throw new Error('Sync failed');

        status.textContent = 'Sync completed successfully';
      } catch (e) {
        status.textContent = 'Sync error';
      }
    });
  });
});
