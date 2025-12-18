// ════════════════════════════════════════════════════════════
//  GABARITKDP BETA SYSTEM - CONFIGURÉ AVEC VOS CLÉS
//  100 Founding Beta Testers + Free Plan
// ════════════════════════════════════════════════════════════

// CONFIGURATION - VOS VRAIES CLÉS
const CONFIG = {
  stripeLink: 'https://buy.stripe.com/3cI7sLglnf1V3BE2RjgUM08', // ← NOUVEAU LIEN (Nov 2025)
  supabaseUrl: 'https://oowazkyngsgwuswlhlzw.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2F6a3luZ3Nnd3Vzd2xobHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzAxMDUsImV4cCI6MjA3NzQwNjEwNX0.XKzrLhVVOrcMMMRC0Zpgd1iVbkgHGqpBcazf3-HWYpw',
  betaExpiryDate: '2025-12-25',
};

// ═══════════════════════════════════════════════════════════
//  CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════

// Vérifier si l'utilisateur est inscrit
function isUserRegistered() {
  return localStorage.getItem('userEmail') !== null;
}

// Obtenir l'email de l'utilisateur
function getUserEmail() {
  return localStorage.getItem('userEmail');
}

// Obtenir le statut de l'utilisateur depuis Supabase
async function getUserStatus(email) {
  try {
    const response = await fetch(
      `${CONFIG.supabaseUrl}/rest/v1/rpc/can_user_export`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
        },
        body: JSON.stringify({ user_email: email }),
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error getting user status:', error);
    return null;
  }
}

// Enregistrer un export dans Supabase
async function recordExportInSupabase(email, format) {
  try {
    const response = await fetch(
      `${CONFIG.supabaseUrl}/rest/v1/rpc/record_export`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
        },
        body: JSON.stringify({
          user_email: email,
          export_format: format,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error('❌ Error recording export:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
//  MAIN EXPORT CHECK FUNCTION
// ═══════════════════════════════════════════════════════════

async function checkBetaAccess() {
  console.log('[BETA] ═══════════════════════════════════════');
  console.log('[BETA] Vérification accès export...');

  // 1. Vérifier si l'utilisateur est inscrit localement
  if (!isUserRegistered()) {
    console.log('[BETA] ❌ Non inscrit - Redirection Stripe');
    showRegistrationPrompt();
    return false;
  }

  const email = getUserEmail();
  console.log('[BETA] ✅ Inscrit:', email);

  // 2. Vérifier le statut dans Supabase
  const status = await getUserStatus(email);

  if (!status) {
    console.error('[BETA] ❌ Erreur Supabase');
    // En cas d'erreur, autoriser quand même (fallback)
    return true;
  }

  console.log('[BETA] Statut:', status);

  // 3. Vérifier si l'utilisateur peut exporter
  if (!status.can_export) {
    console.log('[BETA] ❌ Limite atteinte');
    showLimitReachedMessage(status);
    return false;
  }

  // 4. Afficher le badge approprié
  if (status.is_beta) {
    console.log('[BETA] 🎉 Beta Tester #' + status.beta_number);
    showBetaBadge(status.beta_number);
  } else {
    console.log('[BETA] ✅ Plan gratuit (' + status.exports_remaining + ' restants)');
    showFreePlanBadge(status.exports_remaining);
  }

  console.log('[BETA] ✅ Export autorisé');
  console.log('[BETA] ═══════════════════════════════════════');
  return true;
}

// ═══════════════════════════════════════════════════════════
//  UI FUNCTIONS
// ═══════════════════════════════════════════════════════════

// Afficher le prompt d'inscription (VERSION MODERNE AVEC BOUTON "DÉJÀ INSCRIT")
function showRegistrationPrompt() {
  // Créer une popup custom avec bouton "Déjà inscrit"
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    animation: fadeIn 0.3s;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      animation: scaleIn 0.3s;
    ">
      <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
      
      <h2 style="font-size: 28px; font-weight: 800; color: #1f2937; margin-bottom: 16px;">
        Pour exporter, inscrivez-vous !
      </h2>
      
      <div style="text-align: left; background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 24px 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 24px;">✅</span>
          <span style="font-weight: 600; color: #047857;">Les 100 PREMIERS = Beta Testers illimités jusqu'à Noël 2025</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 24px;">✅</span>
          <span style="font-weight: 600; color: #047857;">Autres = 3 exports gratuits/mois</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 24px;">⚡</span>
          <span style="font-weight: 600; color: #047857;">Inscription en 30 secondes (0$)</span>
        </div>
      </div>
      
      <button id="signup-btn" style="
        width: 100%;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px;
        border: none;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        margin-bottom: 12px;
      ">
        🚀 S'inscrire gratuitement
      </button>
      
      <button id="already-registered-btn" style="
        width: 100%;
        background: white;
        color: #059669;
        padding: 12px;
        border: 2px solid #10b981;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
      ">
        📧 Déjà inscrit ? Entrez votre email
      </button>
      
      <button id="cancel-btn" style="
        width: 100%;
        background: transparent;
        color: #6b7280;
        padding: 8px;
        border: none;
        font-size: 14px;
        cursor: pointer;
      ">
        Plus tard
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animations CSS
  const modalStyle = document.createElement('style');
  modalStyle.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(modalStyle);
  
  // Bouton S'inscrire
  document.getElementById('signup-btn').addEventListener('click', () => {
    modal.remove();
    window.location.href = CONFIG.stripeLink;
  });
  
  // Bouton Déjà inscrit (NOUVEAU !)
  document.getElementById('already-registered-btn').addEventListener('click', () => {
    modal.remove();
    promptForEmailManual();
  });
  
  // Bouton Plus tard
  document.getElementById('cancel-btn').addEventListener('click', () => {
    modal.remove();
  });
}

// Fonction pour demander l'email manuellement
function promptForEmailManual() {
  const email = prompt(
    '📧 Entrez l\'email utilisé lors de l\'inscription Stripe :\n\n' +
    '(Format: votre@email.com)'
  );
  
  if (email && email.includes('@')) {
    localStorage.setItem('userEmail', email.trim().toLowerCase());
    console.log('[BETA] 📧 Email enregistré:', email);
    alert('✅ Parfait ! Rechargement...');
    location.reload();
  } else if (email) {
    alert('❌ Email invalide. Réessayez.');
    promptForEmailManual();
  }
}

// Afficher message limite atteinte
function showLimitReachedMessage(status) {
  alert(
    '⚠️ Limite d\'exports atteinte\n\n' +
    'Exports ce mois : ' + status.exports_used + '/3\n\n' +
    '💡 Options :\n' +
    '- Attendez le mois prochain (renouvellement automatique)\n' +
    '- Passez au plan Pay-per-Export (2,50€/export)\n' +
    '- Passez au plan Pro Unlimited (19,99€/mois)\n\n' +
    'Voir les offres ?'
  );

  if (confirm('Voir les offres ?')) {
    window.location.href = '/index.html#tarifs';
  }
}

// Afficher badge beta tester
function showBetaBadge(betaNumber) {
  removeBadge();

  const badge = document.createElement('div');
  badge.id = 'beta-badge';
  badge.className = 'beta-badge';
  badge.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:24px;">🏆</span>
      <div>
        <div style="font-weight:700;font-size:14px;">Founding Beta Tester #${betaNumber}</div>
        <div style="font-size:11px;opacity:0.9;">Accès illimité jusqu'à Noël 2025</div>
      </div>
    </div>
  `;

  applyBadgeStyles(badge, '#10b981');
  document.body.appendChild(badge);

  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 7000);
}

// Afficher badge plan gratuit
function showFreePlanBadge(remaining) {
  removeBadge();

  const badge = document.createElement('div');
  badge.id = 'beta-badge';
  badge.className = 'beta-badge';
  badge.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:24px;">✅</span>
      <div>
        <div style="font-weight:700;font-size:14px;">Plan Gratuit</div>
        <div style="font-size:11px;opacity:0.9;">${remaining} export${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} ce mois</div>
      </div>
    </div>
  `;

  applyBadgeStyles(badge, '#3b82f6');
  document.body.appendChild(badge);

  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 5000);
}

// Supprimer badge existant
function removeBadge() {
  const existing = document.getElementById('beta-badge');
  if (existing) existing.remove();
}

// Appliquer styles au badge
function applyBadgeStyles(badge, color) {
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, ${color}, ${color}dd);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 14px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10000;
    cursor: pointer;
    animation: slideInRight 0.4s ease-out;
    max-width: 320px;
  `;

  badge.addEventListener('click', () => badge.remove());
}

// ═══════════════════════════════════════════════════════════
//  STRIPE RETURN HANDLER
// ═══════════════════════════════════════════════════════════

async function handleStripeReturn() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('session_id') || urlParams.get('beta') === 'success') {
    if (sessionStorage.getItem('stripeProcessed')) {
      return;
    }

    console.log('[BETA] 🎉 Retour depuis Stripe');
    sessionStorage.setItem('stripeProcessed', 'true');

    // Attendre le webhook
    await new Promise(resolve => setTimeout(resolve, 2000));

    const email = prompt(
      '✅ Inscription réussie !\n\n' +
      'Entrez votre email pour finaliser :'
    );

    if (email && email.includes('@')) {
      localStorage.setItem('userEmail', email);

      const status = await getUserStatus(email);

      if (status && status.is_beta) {
        alert(
          `🏆 FÉLICITATIONS !\n\n` +
          `Vous êtes le Founding Beta Tester #${status.beta_number} !\n\n` +
          `✅ Accès illimité jusqu'à Noël 2025\n` +
          `✅ Badge exclusif\n` +
          `✅ Priorité support\n\n` +
          `Cliquez sur "Export" pour générer votre première cover !`
        );
      } else {
        alert(
          '✅ Bienvenue !\n\n' +
          'Vous avez 3 exports gratuits par mois.\n\n' +
          'Cliquez sur "Export" pour commencer !'
        );
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  STATS DISPLAY
// ═══════════════════════════════════════════════════════════

async function displayBetaStats() {
  try {
    const response = await fetch(
      `${CONFIG.supabaseUrl}/rest/v1/beta_stats?select=*`,
      {
        headers: {
          'apikey': CONFIG.supabaseKey,
          'Authorization': `Bearer ${CONFIG.supabaseKey}`,
        },
      }
    );

    if (!response.ok) return;

    const stats = await response.json();
    const remaining = stats[0]?.spots_remaining || 0;

    console.log('[BETA] 📊 Places beta restantes:', remaining);

    if (remaining < 20 && remaining > 0) {
      showUrgencyBanner(remaining);
    }
  } catch (error) {
    console.error('❌ Error getting stats:', error);
  }
}

function showUrgencyBanner(remaining) {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    z-index: 9999;
    animation: slideInDown 0.4s ease-out;
  `;
  banner.innerHTML = `
    🔥 URGENT : Plus que ${remaining} places Beta Tester disponibles !
  `;

  document.body.appendChild(banner);
}

// ═══════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
  console.log('[BETA] ═══════════════════════════════════════');
  console.log('[BETA] GabaritKDP Beta System v2.0');
  console.log('[BETA] 100 Founding Beta Testers Program');
  console.log('[BETA] ═══════════════════════════════════════');

  handleStripeReturn();
  displayBetaStats();

  setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('session_id') && !urlParams.get('beta')) {
      sessionStorage.removeItem('stripeProcessed');
    }
  }, 5000);
});

// Exposer les fonctions globalement
window.checkBetaAccess = checkBetaAccess;
window.isUserRegistered = isUserRegistered;
window.recordExportInSupabase = recordExportInSupabase;

// CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .beta-badge:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════════
//  DÉTECTION RETOUR STRIPE
// ═══════════════════════════════════════════════════════════

// Fonction pour demander l'email après retour de Stripe
function promptForEmailAfterStripe() {
  const email = prompt(
    '✅ Inscription réussie !\n\n' +
    'Pour finaliser, entrez votre email :\n' +
    '(celui utilisé lors de l\'inscription)'
  );
  
  if (email && email.includes('@')) {
    localStorage.setItem('userEmail', email.trim().toLowerCase());
    console.log('[BETA] 📧 Email enregistré après Stripe:', email);
    
    // Nettoyer l'URL (enlever session_id et beta)
    const url = new URL(window.location.href);
    url.searchParams.delete('session_id');
    url.searchParams.delete('beta');
    window.history.replaceState({}, document.title, url.toString());
    
    // Recharger pour afficher le badge
    alert('🎉 Parfait ! Rechargement...');
    location.reload();
  } else if (email) {
    alert('❌ Email invalide. Réessayez.');
    promptForEmailAfterStripe();
  }
}

// Détecter le retour de Stripe au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const betaSuccess = urlParams.get('beta');
  
  // Détecter soit session_id soit beta=success
  if ((sessionId || betaSuccess === 'success') && !isUserRegistered()) {
    console.log('[BETA] 🔄 Retour de Stripe détecté ! Demande email...');
    setTimeout(() => {
      promptForEmailAfterStripe();
    }, 500);
  }
});

console.log('[BETA] ✅ Système chargé avec succès');
