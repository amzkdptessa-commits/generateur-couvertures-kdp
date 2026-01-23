// js/export-encode.worker.js
self.onmessage = async (e) => {
  const { bitmap, mimeType, quality, filename } = e.data || {};
  try {
    if (!bitmap) throw new Error('Missing bitmap');

    const w = bitmap.width;
    const h = bitmap.height;

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

    ctx.drawImage(bitmap, 0, 0);

    // Encodage performant
    const blob = await canvas.convertToBlob({
      type: mimeType || 'image/png',
      quality: typeof quality === 'number' ? quality : 0.95
    });

    try { bitmap.close(); } catch (_) {}

    self.postMessage({ ok: true, blob, filename });
  } catch (err) {
    self.postMessage({ ok: false, error: String(err && err.message ? err.message : err) });
  }
};
