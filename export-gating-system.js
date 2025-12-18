// ===============================================
// 🔒 EMAIL WALL – Export nécessite inscription Beta
// (UTF-8, unifié, clic fiable)
// ===============================================

const GATING_CONFIG = {
  freeExports: 0,                  // Email requis dès le 1er export
  expiryDate: '2025-12-25T23:59:59'
};

let pendingExport = false;
let exportTriggered = false;

// ------------------------------
// Helpers LocalStorage
// ------------------------------
function hasUserEmail() {
  // On accepte les deux clés pour compatibilité
  return (
    !!localStorage.getItem('userEmail') ||
    !!localStorage.getItem('betaTesterEmail')
  );
}

function getStoredEmail() {
  return (
    localStorage.getItem('userEmail') ||
    localStorage.getItem('betaTesterEmail') ||
    null
  );
}

// Renvoyé pour compatibilité avec generator.html
function getBetaTesterStatus() {
  const email =
    localStorage.getItem('betaTesterEmail') ||
    localStorage.getItem('userEmail');

  const badgeNumber = localStorage.getItem('betaBadgeNumber');
  if (email) {
    return {
      email,
      badge_number: badgeNumber ? parseInt(badgeNumber, 10) : null,
      is_beta: true
    };
  }
  return null;
}

// ------------------------------
// Contrôle avant export
// ------------------------------
function checkExportPermission() {
  if (hasUserEmail()) {
    console.log('✅ Email détecté, export autorisé');
    pendingExport = false;
    return { allowed: true };
  }

  console.log("⏳ Pas d'email → ouverture de l’inscription Beta");
  pendingExport = true;

  // Ouvre la modale d’inscription si disponible
  try {
    if (window.GabaritKDP && typeof window.GabaritKDP.showBetaSignupModal === 'function') {
      window.GabaritKDP.showBetaSignupModal();
      return { allowed: false, reason: 'Email required - Beta modal opened' };
    }
  } catch (e) {
    console.warn('showBetaSignupModal error:', e);
  }

  // Fallback : fonction globale si exposée ailleurs
  if (typeof window.showBetaSignupModal === 'function') {
    window.showBetaSignupModal();
    return { allowed: false, reason: 'Email required - Beta modal opened (fallback)' };
  }

  console.error('❌ Aucune fonction pour afficher la modale Beta');
  alert('Please sign up to export. (Beta modal unavailable)');
  return { allowed: false, reason: 'Beta signup function not available' };
}

// Wrapper utilisé par le bouton Export
function checkExportAllowed() {
  const res = checkExportPermission();
  return !!res.allowed;
}

// ------------------------------
// Déclenchement de l’export après inscription
// ------------------------------
function triggerPendingExport() {
  if (!pendingExport || !hasUserEmail()) return;

  if (exportTriggered) {
    console.log('ℹ️ Export déjà déclenché, on ignore.');
    return;
  }
  exportTriggered = true;
  pendingExport = false;

  // Fermer éventuels overlays
  document.querySelectorAll('.welcome-popup-overlay, #beta-signup-modal')
    .forEach(el => el.remove());

  setTimeout(() => {
    // 1) Si une fonction globale d’export existe
    if (typeof window.exportCover === 'function') {
      console.log('🚀 Appel direct window.exportCover()');
      try {
        window.exportCover();
        return;
      } catch (e) {
        console.warn('exportCover() a échoué, on tente un clic DOM.', e);
      }
    }

    // 2) Sinon, on tente de cliquer un bouton Export de façon robuste
    const candidates = [
      '[data-action="export"]',
      '[onclick*="exportCover"]',
      'button[id*="export"]',
      'button[class*="export"]',
      'a[id*="export"]',
      'a[class*="export"]'
    ];

    let exportBtn = null;
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) { exportBtn = el; break; }
    }
    // Fallback sur libellé
    if (!exportBtn) {
      exportBtn = Array.from(document.querySelectorAll('button, a'))
        .find(b => /export/i.test(b.innerText || b.textContent || ''));
    }

    if (exportBtn) {
      console.log('✅ Bouton Export trouvé → dispatchEvent(click)');
      exportBtn.dispatchEvent(new Event('click', { bubbles: true }));
    } else {
      console.log('⚠️ Bouton Export introuvable. Affichage d’un message.');
      alert('✅ Registration completed! Please click “Export” again to download your cover.');
    }

    // On libère le verrou après un court délai au cas où l’utilisateur retente
    setTimeout(() => { exportTriggered = false; }, 3000);
  }, 500);
}

// ------------------------------
// Écoutes & Polling
// ------------------------------
window.addEventListener('storage', (e) => {
  if (['betaTesterEmail', 'userEmail'].includes(e.key) && e.newValue) {
    console.log('📧 Email inscrit détecté via storage event → export');
    triggerPendingExport();
  }
});

// Polling léger pour le cas où l’inscription se fait dans le même onglet
setInterval(() => {
  if (pendingExport && hasUserEmail()) {
    triggerPendingExport();
  }
}, 600);

// ------------------------------
// Exports globaux
// ------------------------------
window.exportGating = {
  check: checkExportPermission,
  hasEmail: hasUserEmail,
  getEmail: getStoredEmail,
  config: GATING_CONFIG,
  triggerPending: triggerPendingExport
};

window.GabaritKDP = window.GabaritKDP || {};
window.GabaritKDP.getBetaTesterStatus = getBetaTesterStatus;
window.checkExportAllowed = checkExportAllowed;

console.log('✅ Email Wall chargé (unifié).');
console.log('📦 APIs: window.exportGating, window.checkExportAllowed, window.GabaritKDP.getBetaTesterStatus');
