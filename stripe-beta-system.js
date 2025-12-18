// ============================================
// SYSTEME BETA ULTRA-SIMPLE - STRIPE 0 USD
// GabaritKDP - Version finale avec votre lien
// ============================================

// VOTRE LIEN STRIPE EN USD (Free Plan - 0,00 $US)
const STRIPE_BETA_LINK = 'https://buy.stripe.com/14A4gz5GJ6vp3BE4ZrgUM07';

// Fonction pour verifier si l'utilisateur est deja inscrit
function isUserRegistered() {
  return localStorage.getItem('betaEmail') !== null;
}

// Fonction appelee au clic sur Export
function checkBetaAccess() {
  console.log('[BETA] Verification acces beta...');
  
  if (isUserRegistered()) {
    console.log('[BETA] Utilisateur deja inscrit - Export autorise');
    return true; // Autoriser l'export
  }
  
  console.log('[BETA] Utilisateur non inscrit - Redirection vers Stripe');
  
  // Afficher un message avant la redirection
  const userConfirmed = confirm(
    '🚀 Pour exporter vos covers, rejoignez gratuitement notre programme beta !\n\n' +
    '✅ Acces illimite jusqu\'a Noel 2025\n' +
    '✅ Totalement gratuit (0 $)\n' +
    '✅ Inscription en 30 secondes\n\n' +
    'Continuer ?'
  );
  
  if (userConfirmed) {
    window.location.href = STRIPE_BETA_LINK;
  }
  
  return false; // Bloquer l'export
}

// Gestion du retour depuis Stripe
function handleStripeReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('beta') === 'success') {
    console.log('[BETA] ========================================');
    console.log('[BETA] Retour depuis Stripe - Inscription reussie !');
    console.log('[BETA] ========================================');
    
    // Sauvegarder l'inscription (Stripe a deja collecte l'email)
    localStorage.setItem('betaEmail', 'collected');
    localStorage.setItem('betaDate', new Date().toISOString());
    localStorage.setItem('betaUnlimited', 'true');
    localStorage.setItem('betaExpiry', '2025-12-25');
    
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Message de bienvenue
    const welcomeMessage = 
      '🎉 Bienvenue dans le programme beta GabaritKDP !\n\n' +
      '✅ Vous avez maintenant un acces illimite\n' +
      '✅ Valable jusqu\'au 25 decembre 2025\n' +
      '✅ Aucune limite d\'exports\n\n' +
      'Votre export va se lancer automatiquement...';
    
    alert(welcomeMessage);
    
    // Declencher l'export automatiquement apres un court delai
    console.log('[BETA] Tentative de declenchement automatique de l\'export...');
    
    setTimeout(() => {
      // Chercher le bouton export avec plusieurs selecteurs possibles
      const exportBtn = 
        document.querySelector('[onclick*="handleExportClick"]') ||
        document.querySelector('[onclick*="export"]') ||
        document.querySelector('#export-btn') ||
        document.querySelector('button[class*="export"]') ||
        Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.toLowerCase().includes('export')
        );
      
      if (exportBtn) {
        console.log('[BETA] ✅ Bouton export trouve, declenchement...');
        exportBtn.click();
      } else {
        console.log('[BETA] ⚠️ Bouton export non trouve');
        console.log('[BETA] L\'utilisateur peut cliquer manuellement sur Export');
      }
    }, 1500);
  }
}

// Fonction pour afficher le statut dans la console (debug)
function displayBetaStatus() {
  if (isUserRegistered()) {
    const betaDate = localStorage.getItem('betaDate');
    const betaExpiry = localStorage.getItem('betaExpiry');
    console.log('[BETA] ========================================');
    console.log('[BETA] Statut : INSCRIT ✅');
    console.log('[BETA] Date d\'inscription :', betaDate);
    console.log('[BETA] Expiration :', betaExpiry);
    console.log('[BETA] Exports : ILLIMITES');
    console.log('[BETA] ========================================');
  } else {
    console.log('[BETA] ========================================');
    console.log('[BETA] Statut : NON INSCRIT ❌');
    console.log('[BETA] L\'export sera bloque');
    console.log('[BETA] Inscription gratuite disponible');
    console.log('[BETA] Lien Stripe (0 $) : ' + STRIPE_BETA_LINK);
    console.log('[BETA] ========================================');
  }
}

// Fonction pour afficher un badge beta dans l'interface (optionnel)
function showBetaBadge() {
  if (!isUserRegistered()) return;
  
  const badge = document.createElement('div');
  badge.id = 'beta-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    cursor: pointer;
  `;
  badge.innerHTML = '🎉 Beta Tester - Exports illimites';
  badge.title = 'Vous etes inscrit au programme beta jusqu\'au 25/12/2025';
  
  // Supprimer au clic
  badge.addEventListener('click', () => badge.remove());
  
  document.body.appendChild(badge);
  
  // Auto-suppression apres 5 secondes
  setTimeout(() => {
    if (badge.parentNode) badge.remove();
  }, 5000);
}

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  console.log('[BETA] ========================================');
  console.log('[BETA] GabaritKDP Beta System v1.0');
  console.log('[BETA] Systeme ultra-simple charge avec succes');
  console.log('[BETA] Prix : 0,00 $US (GRATUIT)');
  console.log('[BETA] ========================================');
  
  // Afficher le statut
  displayBetaStatus();
  
  // Gerer le retour depuis Stripe
  handleStripeReturn();
  
  // Afficher le badge si inscrit (avec un delai)
  setTimeout(showBetaBadge, 1000);
});

// Exposer les fonctions globalement
window.checkBetaAccess = checkBetaAccess;
window.isUserRegistered = isUserRegistered;
window.displayBetaStatus = displayBetaStatus;

console.log('[BETA] Lien Stripe USD configure : ' + STRIPE_BETA_LINK);
