// ============================================
// SUPABASE CONFIGURATION
// ============================================

// ✅ Configuration Supabase (clés configurées)
const SUPABASE_URL = 'https://oowazkyrigsqwuswlhlzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2F6a3luZ3Nnd3Vzd2xobHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzAxMDUsImV4cCI6MjA3NzQwNjEwNX0.XKzrLhVVOrcMMMRC0Zpgd1iVbkgHGqpBcazf3-HWYpw';

// Initialiser Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FONCTIONS D'INSCRIPTION BETA TESTER
// ============================================

// Compter combien de places restent
async function getRemainingSpots() {
  try {
    const { count, error } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    return Math.max(0, 10 - count);
  } catch (error) {
    console.error('❌ Erreur getRemainingSpots:', error);
    return 0;
  }
}

// Mettre à jour le compteur visuel
async function updateSpotsCounter() {
  const remaining = await getRemainingSpots();
  
  // Compteur page principale
  const mainCounter = document.getElementById('slotsRemaining');
  if (mainCounter) {
    mainCounter.textContent = remaining;
  }
  
  // Compteur dans le modal
  const modalCounter = document.getElementById('modalSlotsRemaining');
  if (modalCounter) {
    modalCounter.textContent = remaining;
  }
}

// Vérifier si un email est déjà inscrit
async function checkIfEmailExists(email) {
  try {
    const { data, error } = await supabase
      .from('beta_testers')
      .select('email')
      .eq('email', email)
      .single();
    
    return data !== null;
  } catch (error) {
    return false;
  }
}

// Inscrire un beta tester
async function signupBetaTester(email, name) {
  try {
    // 1. Vérifier qu'il reste des places
    const remaining = await getRemainingSpots();
    if (remaining === 0) {
      return {
        success: false,
        message: document.documentElement.lang === 'fr' 
          ? 'Désolé, toutes les places sont prises !' 
          : 'Sorry, all spots are taken!'
      };
    }
    
    // 2. Vérifier si l'email est déjà inscrit
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      return {
        success: false,
        message: document.documentElement.lang === 'fr'
          ? 'Cet email est déjà inscrit !'
          : 'This email is already registered!'
      };
    }
    
    // 3. Compter le nombre actuel pour assigner le badge
    const { count } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true });
    
    const badgeNumber = count + 1;
    
    // 4. Insérer dans la base de données
    const { data, error } = await supabase
      .from('beta_testers')
      .insert([
        {
          email: email,
          name: name,
          badge_number: badgeNumber,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    // 5. Envoyer email de confirmation
    await sendConfirmationEmail(email, name, badgeNumber);
    
    return {
      success: true,
      data: {
        badge_number: badgeNumber,
        email: email,
        name: name
      }
    };
    
  } catch (error) {
    console.error('❌ Erreur signupBetaTester:', error);
    return {
      success: false,
      message: document.documentElement.lang === 'fr'
        ? 'Une erreur est survenue. Veuillez réessayer.'
        : 'An error occurred. Please try again.'
    };
  }
}

// Envoyer email de confirmation
async function sendConfirmationEmail(email, name, badgeNumber) {
  try {
    const isWinner = badgeNumber <= 10;
    const lang = document.documentElement.lang || 'en';
    
    // Préparer le contenu de l'email
    const subject = lang === 'fr'
      ? `🎉 Bienvenue Beta Tester #${badgeNumber} !`
      : `🎉 Welcome Beta Tester #${badgeNumber}!`;
    
    // Appeler la Edge Function pour envoyer l'email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        subject: subject,
        name: name,
        badgeNumber: badgeNumber,
        isWinner: isWinner
      }
    });
    
    if (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
    
    console.log('✅ Email envoyé avec succès à', email);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur sendConfirmationEmail:', error);
    return false;
  }
}

// ============================================
// MODAL INSCRIPTION
// ============================================

function showBetaSignupModal() {
  // Créer le modal
  const modal = document.createElement('div');
  modal.id = 'beta-signup-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const lang = document.documentElement.lang || 'en';
  const isEnglish = lang !== 'fr';
  
  const texts = {
    title: isEnglish ? 'Become a Beta Tester' : 'Devenez Beta Tester',
    subtitle: isEnglish ? 'Join the first 100 founders' : 'Rejoignez les 100 premiers fondateurs',
    benefit1: isEnglish ? 'Unlimited exports until Christmas' : 'Exports illimités jusqu\'à Noël',
    benefit2: isEnglish ? 'Exclusive numbered badge' : 'Badge exclusif numéroté',
    benefit3: isEnglish ? 'Priority support' : 'Support prioritaire',
    nameLabel: isEnglish ? 'Full name' : 'Nom complet',
    namePlaceholder: isEnglish ? 'John Smith' : 'Sophie Martin',
    emailPlaceholder: isEnglish ? 'john@example.com' : 'sophie@exemple.com',
    submitBtn: isEnglish ? '🚀 Sign up now' : '🚀 S\'inscrire maintenant',
    cancelBtn: isEnglish ? 'Cancel' : 'Annuler',
    spotsText: isEnglish ? '⏰ Only ' : '⏰ Plus que ',
    spotsEnd: isEnglish ? ' spots left' : ' places disponibles'
  };
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideInUp 0.4s ease-out;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h2 style="font-size: 28px; font-weight: 800; color: #1f2937; margin-bottom: 8px;">
          ${texts.title}
        </h2>
        <p style="color: #6b7280; font-size: 15px;">
          ${texts.subtitle}
        </p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 24px;">✅</span>
          <span style="font-weight: 600; color: #047857;">${texts.benefit1}</span>
        </div>
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 24px;">🏆</span>
          <span style="font-weight: 600; color: #047857;">${texts.benefit2}</span>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="font-size: 24px;">⚡</span>
          <span style="font-weight: 600; color: #047857;">${texts.benefit3}</span>
        </div>
      </div>
      
      <form id="beta-signup-form">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
            ${texts.nameLabel}
          </label>
          <input type="text" id="beta-name" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; transition: all 0.3s;"
                 placeholder="${texts.namePlaceholder}"
                 onfocus="this.style.borderColor='#10b981'"
                 onblur="this.style.borderColor='#e5e7eb'">
        </div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px; font-size: 14px;">
            Email
          </label>
          <input type="email" id="beta-email" required 
                 style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 15px; transition: all 0.3s;"
                 placeholder="${texts.emailPlaceholder}"
                 onfocus="this.style.borderColor='#10b981'"
                 onblur="this.style.borderColor='#e5e7eb'">
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button type="submit" 
                  style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 24px; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s;"
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(16,185,129,0.4)'"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            ${texts.submitBtn}
          </button>
          <button type="button" onclick="document.getElementById('beta-signup-modal').remove()"
                  style="padding: 14px 24px; border: 2px solid #e5e7eb; background: white; border-radius: 10px; font-size: 16px; font-weight: 600; color: #6b7280; cursor: pointer; transition: all 0.3s;"
                  onmouseover="this.style.borderColor='#d1d5db'"
                  onmouseout="this.style.borderColor='#e5e7eb'">
            ${texts.cancelBtn}
          </button>
        </div>
      </form>
      
      <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af;">
        ${texts.spotsText}<span class="beta-spots-counter" style="font-weight: 700; color: #10b981;">...</span>${texts.spotsEnd}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Mettre à jour le compteur
  updateSpotsCounter();
  
  // Gérer la soumission du formulaire
  document.getElementById('beta-signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('beta-name').value.trim();
    const email = document.getElementById('beta-email').value.trim();
    
    if (!name || !email) {
      alert(isEnglish ? 'Please fill all fields' : 'Veuillez remplir tous les champs');
      return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = isEnglish ? '⏳ Signing up...' : '⏳ Inscription...';
    
    // Inscrire le beta tester
    const result = await signupBetaTester(email, name);
    
    if (result.success) {
      // Succès ! Afficher modal de confirmation
      showSuccessModal(result.data.badge_number, name);
      modal.remove();
      updateSpotsCounter();
    } else {
      // Erreur
      alert(result.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
  
  // Fermer en cliquant à l'extérieur
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Modal de succès après inscription
function showSuccessModal(badgeNumber, name) {
  const modal = document.createElement('div');
  modal.id = 'success-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const lang = document.documentElement.lang || 'en';
  const isEnglish = lang !== 'fr';
  const isWinner = badgeNumber <= 10;
  
  const welcomeText = isEnglish 
    ? `Welcome Beta Tester #${badgeNumber}!`
    : `Bienvenue Beta Tester #${badgeNumber} !`;
    
  const accessText = isEnglish
    ? 'Your unlimited access is active until December 25, 2025'
    : 'Votre accès illimité est activé jusqu\'au 25 décembre 2025';
    
  const founderText = isEnglish
    ? 'You are one of the first 100 founders!'
    : 'Vous faites partie des 100 premiers fondateurs !';
    
  const winnerText = isEnglish
    ? `🎊 Congratulations! You won the PRO plan for life! 🎊`
    : `🎊 Félicitations ! Vous avez gagné le plan PRO à vie ! 🎊`;
    
  const buttonText = isEnglish
    ? '🚀 Start creating'
    : '🚀 Commencer à créer';
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 40px; max-width: 500px; width: 90%; text-align: center; animation: scaleIn 0.5s ease-out;">
      <div style="font-size: 72px; margin-bottom: 24px;">🎉</div>
      <h2 style="font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 16px;">
        ${welcomeText}
      </h2>
      
      ${isWinner ? `
        <p style="font-size: 20px; color: #d97706; font-weight: 700; margin-bottom: 24px;">
          ${winnerText}
        </p>
      ` : ''}
      
      <p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">
        ${accessText}
      </p>
      
      <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
        <div style="font-size: 20px; font-weight: 700; color: #047857; margin-bottom: 12px;">
          🏆 Badge: Founding Beta Tester #${badgeNumber}
        </div>
        <div style="font-size: 14px; color: #065f46;">
          ${founderText}
        </div>
      </div>
      
      <button onclick="document.getElementById('success-modal').remove(); window.location.href='generator.html'"
              style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 32px; border: none; border-radius: 10px; font-size: 18px; font-weight: 700; cursor: pointer;"
              onmouseover="this.style.transform='scale(1.05)'"
              onmouseout="this.style.transform='scale(1)'">
        ${buttonText}
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ============================================
// MODAL GIVEAWAY (simple reveal)
// ============================================

function showGiveawayRevealModal() {
  // Pour l'instant, ouvre le modal d'inscription
  showBetaSignupModal();
}

// ============================================
// ANIMATIONS CSS
// ============================================

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInUp {
    from { 
      opacity: 0;
      transform: translateY(30px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
`;
document.head.appendChild(style);

// ============================================
// INITIALISATION
// ============================================

window.GabaritKDP = {
  showBetaSignupModal: showBetaSignupModal,
  showGiveawayRevealModal: showGiveawayRevealModal,
  updateSpotsCounter: updateSpotsCounter
};

// Mettre à jour les compteurs au chargement
document.addEventListener('DOMContentLoaded', () => {
  updateSpotsCounter();
});

console.log('✅ GabaritKDP Beta System loaded (REAL SUPABASE CONNECTION)');
