// ============================================
// Supabase + Beta Signup (UTF-8, clean)
// ============================================

// ✅ Supabase config
const SUPABASE_URL = 'https://oowazkyrigsqwuswlhlzw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2F6a3luZ3Nnd3Vzd2xobHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzAxMDUsImV4cCI6MjA3NzQwNjEwNX0.XKzrLhVVOrcMMMRC0Zpgd1iVbkgHGqpBcazf3-HWYpw';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Utils
// ============================================

function setBetaLocalStorage({ email, name, badge_number }) {
  // Unifier les clés utilisées par tous les scripts
  localStorage.setItem('betaTesterEmail', email);
  localStorage.setItem('userEmail', email); // 👈 clé vue par l’email wall
  localStorage.setItem('betaTesterName', name || '');
  localStorage.setItem('betaBadgeNumber', String(badge_number));

  // Date d’expiration de l’accès illimité (ex : Noël 2025)
  const expiry = '2025-12-25T23:59:59Z';
  localStorage.setItem('betaUnlimitedExpiry', expiry);
}

function getBetaTesterStatusLS() {
  const email = localStorage.getItem('betaTesterEmail');
  if (!email) return null;
  const badgeNumber = parseInt(localStorage.getItem('betaBadgeNumber') || '0', 10) || null;
  const expiry = localStorage.getItem('betaUnlimitedExpiry') || null;
  return { email, badge_number: badgeNumber, is_beta: true, expiry };
}

// Expose pour generator.html et l’email wall
window.GabaritKDP = window.GabaritKDP || {};
window.GabaritKDP.getBetaTesterStatus = getBetaTesterStatusLS;

// ============================================
// Data helpers
// ============================================

async function getRemainingSpots(limit = 100) {
  try {
    const { count, error } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    const used = count || 0;
    return Math.max(0, limit - used);
  } catch (e) {
    console.error('getRemainingSpots error:', e);
    return 0;
  }
}

async function updateSpotsCounter() {
  const remaining = await getRemainingSpots(100);
  const els = document.querySelectorAll('#slotsRemaining, #modalSlotsRemaining, .beta-spots-counter');
  els.forEach((el) => (el.textContent = String(remaining)));
}

async function emailExists(email) {
  try {
    const { data } = await supabase
      .from('beta_testers')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

// ============================================
// Signup flow
// ============================================

async function sendConfirmationEmail(email, name, badgeNumber) {
  try {
    const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    const subject =
      lang === 'fr'
        ? `🎉 Bienvenue Beta Tester #${badgeNumber} !`
        : `🎉 Welcome Beta Tester #${badgeNumber}!`;

    const { error } = await supabase.functions.invoke('send-email', {
      body: { to: email, subject, name, badgeNumber, isWinner: badgeNumber <= 100 },
    });
    if (error) throw error;
    return true;
  } catch (e) {
    console.warn('sendConfirmationEmail warning:', e);
    return false;
  }
}

async function signupBetaTester(email, name) {
  // 1) Places restantes
  const remaining = await getRemainingSpots(100);
  if (remaining <= 0) {
    return {
      success: false,
      message:
        document.documentElement.lang === 'fr'
          ? 'Désolé, toutes les places sont prises.'
          : 'Sorry, all spots are taken.',
    };
  }

  // 2) Email déjà utilisé ?
  if (await emailExists(email)) {
    return {
      success: false,
      message:
        document.documentElement.lang === 'fr'
          ? 'Cet email est déjà inscrit.'
          : 'This email is already registered.',
    };
  }

  // 3) Numéro de badge (count + 1)
  const { count, error: countErr } = await supabase
    .from('beta_testers')
    .select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error(countErr);
  }
  const badge_number = (count || 0) + 1;

  // 4) Insert
  const { data, error } = await supabase
    .from('beta_testers')
    .insert([{ email, name, badge_number, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) {
    console.error('signup insert error:', error);
    return {
      success: false,
      message:
        document.documentElement.lang === 'fr'
          ? 'Une erreur est survenue. Réessayez.'
          : 'An error occurred. Please try again.',
    };
  }

  // 5) LocalStorage unifié
  setBetaLocalStorage({ email, name, badge_number });

  // 6) Email de confirmation (non bloquant)
  sendConfirmationEmail(email, name, badge_number);

  return { success: true, data: { email, name, badge_number } };
}

// ============================================
// UI Modals
// ============================================

function showSuccessModal(badgeNumber, name) {
  // Petit overlay de bienvenue
  const overlay = document.createElement('div');
  overlay.className = 'welcome-popup-overlay';
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;max-width:520px;width:92%;padding:32px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,0.35);">
      <div style="font-size:56px;line-height:1;margin-bottom:10px;">🎉</div>
      <h2 style="font-weight:800;font-size:26px;margin-bottom:6px;">
        Welcome Beta Tester #${badgeNumber}!
      </h2>
      <p style="color:#6b7280;margin-bottom:16px;">
        ${name ? `${name}, ` : ''}you just unlocked unlimited exports until December 25, 2025.
      </p>
      <div style="background:#ecfdf5;border:2px solid #a7f3d0;border-radius:12px;padding:14px 16px;margin-bottom:18px;">
        <strong>🏅 Badge:</strong> Founding Beta Tester #${badgeNumber}
      </div>
      <button id="welcome-start-btn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:12px 20px;border-radius:10px;font-weight:800;cursor:pointer;">
        Start creating
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Fermer + déclencher l’export en attente si l’email wall attendait
  const btn = overlay.querySelector('#welcome-start-btn');
  btn.addEventListener('click', () => {
    overlay.remove();
    try {
      // Si le système d’export attendait, on le réveille
      if (window.exportGating && typeof window.exportGating.triggerPending === 'function') {
        window.exportGating.triggerPending();
      }
    } catch (e) {
      console.warn('triggerPending error:', e);
    }
  });
}

function showBetaSignupModal() {
  const lang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
  const t = (fr, en) => (lang === 'fr' ? fr : en);

  const modal = document.createElement('div');
  modal.id = 'beta-signup-modal';
  modal.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);z-index:10000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px;max-width:520px;width:92%;box-shadow:0 24px 80px rgba(0,0,0,0.35);">
      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:48px">🚀</div>
        <h2 style="font-weight:800;font-size:24px;margin-top:6px">${t('Devenez Beta Tester', 'Become a Beta Tester')}</h2>
        <p style="color:#6b7280">${t('Rejoignez les 100 premiers fondateurs', 'Join the first 100 founders')}</p>
      </div>

      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:14px;border-radius:12px;margin-bottom:16px;">
        <div style="display:flex;gap:10px;align-items:center"><span>✅</span><span>${t('Exports illimités jusqu’à Noël 2025', 'Unlimited exports until Christmas 2025')}</span></div>
        <div style="display:flex;gap:10px;align-items:center"><span>🏆</span><span>${t('Badge exclusif numéroté', 'Exclusive numbered badge')}</span></div>
        <div style="display:flex;gap:10px;align-items:center"><span>⚡</span><span>${t('Support prioritaire', 'Priority support')}</span></div>
      </div>

      <form id="beta-signup-form">
        <label style="display:block;font-weight:600;margin-bottom:6px">${t('Nom complet', 'Full name')}</label>
        <input id="beta-name" type="text" required style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:10px;margin-bottom:12px"/>

        <label style="display:block;font-weight:600;margin-bottom:6px">Email</label>
        <input id="beta-email" type="email" required style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:10px;margin-bottom:16px"/>

        <div style="display:flex;gap:10px;align-items:center;justify-content:space-between">
          <button type="submit" style="flex:1;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:12px 16px;border-radius:10px;font-weight:800;cursor:pointer">
            ${t("S'inscrire maintenant", 'Sign up now')}
          </button>
          <button type="button" id="beta-cancel" style="padding:12px 16px;border:2px solid #e5e7eb;border-radius:10px;background:#fff;font-weight:700;cursor:pointer">
            ${t('Annuler', 'Cancel')}
          </button>
        </div>
      </form>

      <div style="text-align:center;margin-top:12px;color:#9ca3af">
        ${t('⏰ Plus que ', '⏰ Only ')}<span class="beta-spots-counter">…</span>${t(' places disponibles', ' spots left')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  updateSpotsCounter();

  modal.querySelector('#beta-cancel').addEventListener('click', () => modal.remove());

  modal.querySelector('#beta-signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = modal.querySelector('#beta-name').value.trim();
    const email = modal.querySelector('#beta-email').value.trim();

    if (!name || !email) return;

    const btn = modal.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('Inscription…', 'Signing up…');

    const res = await signupBetaTester(email, name);

    if (res.success) {
      const { badge_number } = res.data;
      modal.remove();
      showSuccessModal(badge_number, name);
      // Si un export était en attente, on réveille le système d’export (redondance de sécurité)
      try {
        if (window.exportGating && typeof window.exportGating.triggerPending === 'function') {
          window.exportGating.triggerPending();
        }
      } catch {}
    } else {
      alert(res.message || t('Erreur. Réessayez.', 'Error. Please try again.'));
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

// Expose pour d’autres scripts
window.GabaritKDP.showBetaSignupModal = showBetaSignupModal;

// Auto-update du compteur si la modale reste ouverte
setInterval(() => {
  if (document.getElementById('beta-signup-modal')) updateSpotsCounter();
}, 5000);
