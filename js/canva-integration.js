/* =========================================================================
   canva-integration.js  —  MODE PICKER (Design Button v2, SANS OAuth)
   -------------------------------------------------------------------------
   ✅ Charge le SDK Canva une seule fois
   ✅ Initialise tous les boutons [data-canva-button]
   ✅ Envoie l’export via callback global + CustomEvent
   ✅ Zéro dépendance à Babel/Tailwind
   -------------------------------------------------------------------------
   Utilisation HTML minimaliste :

   <button
     type="button"
     class="btn"
     data-canva-button
     data-role="front"                 <!-- optionnel, pour te repérer -->
     data-design-type="A4"             <!-- ex: A4, Poster, InstagramPost -->
     data-export-format="PNG"          <!-- PNG | JPG | PDF -->
     data-export-width="3000"          <!-- optionnel -->
     data-export-height="3000"         <!-- optionnel -->
   >
     Import from Canva
   </button>

   // Callback global (optionnel)
   window.handleCanvaPublish = function (role, payload) {
     // payload = { exportUrl, designId }
     console.log('PUBLISH from role:', role, payload);
     // Exemple: document.querySelector('#frontUrl').value = payload.exportUrl;
   };

   // Ou via CustomEvent:
   document.addEventListener('canva:publish', (e) => {
     // e.detail = { role, exportUrl, designId, sourceEl }
     console.log('EVENT canva:publish', e.detail);
   });
   ========================================================================= */

(function () {
  const SDK_URL = 'https://sdk.canva.com/designbutton/v2/api.js';
  const READY_POLL_INTERVAL = 25; // ms
  const READY_POLL_TIMEOUT = 10_000; // ms

  // -----------------------------------------------------------------------
  // Utils
  // -----------------------------------------------------------------------
  function once(fn) {
    let done = false, result;
    return function (...args) {
      if (!done) {
        done = true;
        result = fn.apply(this, args);
      }
      return result;
    };
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      // Déjà chargé ?
      if (document.querySelector('script[data-canva-sdk="v2"]')) {
        return resolve();
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-canva-sdk', 'v2');
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Canva SDK'));
      document.head.appendChild(s);
    });
  }

  function waitForDesignButtonReady(timeoutMs = READY_POLL_TIMEOUT) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function poll() {
        if (window.Canva && window.Canva.DesignButton && typeof window.Canva.DesignButton.initialize === 'function') {
          return resolve();
        }
        if (Date.now() - start > timeoutMs) {
          return reject(new Error('Canva.DesignButton not available (timeout)'));
        }
        setTimeout(poll, READY_POLL_INTERVAL);
      })();
    });
  }

  function toInt(val, fallback) {
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  // -----------------------------------------------------------------------
  // Initialisation des boutons
  // -----------------------------------------------------------------------
  async function initCanvaButtons() {
    // Évite double init
    if (window.__canvaPickerInitialized) return;
    window.__canvaPickerInitialized = true;

    // Charge le SDK UNE SEULE FOIS si absent
    if (!(window.Canva && window.Canva.DesignButton)) {
      await loadScriptOnce(SDK_URL);
      await waitForDesignButtonReady();
    }

    const buttons = Array.from(document.querySelectorAll('[data-canva-button]'));
    if (!buttons.length) return;

    // Configuration par défaut
    const DEFAULTS = {
      designType: 'A4',        // type de design Canva
      exportFormat: 'PNG',     // PNG | JPG | PDF
      exportWidth: null,       // px
      exportHeight: null       // px
    };

    // Initialise chaque bouton
    buttons.forEach((el) => {
      // Empêche double binding
      if (el.__canvaBound) return;
      el.__canvaBound = true;

      const role = el.getAttribute('data-role') || null;
      const designType = el.getAttribute('data-design-type') || DEFAULTS.designType;
      const exportFormat = (el.getAttribute('data-export-format') || DEFAULTS.exportFormat).toUpperCase();
      const exportWidth = toInt(el.getAttribute('data-export-width'), DEFAULTS.exportWidth);
      const exportHeight = toInt(el.getAttribute('data-export-height'), DEFAULTS.exportHeight);

      // Construction de la config publish/export
      const exportConfig = { format: exportFormat };
      if (exportWidth) exportConfig.width = exportWidth;
      if (exportHeight) exportConfig.height = exportHeight;

      // Bind via SDK (Design Button v2)
      window.Canva.DesignButton.initialize({
        buttonSelector: undefined, // on passe l’élément directement
        // On peut passer un élément DOM direct :
        target: el,
        design: {
          type: designType
        },
        publish: {
          target: 'EXPORT',
          export: exportConfig
        },
        onDesignPublish: ({ exportUrl, designId }) => {
          // 1) Callback global si présent
          if (typeof window.handleCanvaPublish === 'function') {
            try {
              window.handleCanvaPublish(role, { exportUrl, designId });
            } catch (_) { /* ignore */ }
          }

          // 2) CustomEvent pour la page
          const evt = new CustomEvent('canva:publish', {
            detail: { role, exportUrl, designId, sourceEl: el }
          });
          document.dispatchEvent(evt);

          // 3) Feedback visuel simple
          try {
            el.classList.add('is-published');
            setTimeout(() => el.classList.remove('is-published'), 1500);
          } catch (_) {}
        }
      });
    });
  }

  // -----------------------------------------------------------------------
  // Exposition publique
  // -----------------------------------------------------------------------
  window.CanvaPicker = {
    init: once(() => initCanvaButtons()),
    // helper pour re-scan si tu ajoutes des boutons dynamiquement
    refresh: () => initCanvaButtons()
  };

  // Auto-init quand DOM prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.CanvaPicker.init());
  } else {
    window.CanvaPicker.init();
  }
})();
