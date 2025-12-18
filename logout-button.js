(function () {
  'use strict';

  const TAG = '🚪 [LOGOUT]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

  log('Script chargé', { readyState: document.readyState, href: location.href });

  // Utilitaire: check visibilité
  function describeElement(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      class: el.className,
      id: el.id,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      overflow: cs.overflow,
      position: cs.position,
      zIndex: cs.zIndex,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      inDOM: document.documentElement.contains(el),
    };
  }

  async function waitForNavLinks(timeoutMs = 10000) {
    log('waitForNavLinks() start', { timeoutMs });

    // Essai immédiat
    const immediate = document.querySelector('.nav-links');
    if (immediate) {
      log('waitForNavLinks() found immediately', describeElement(immediate));
      return immediate;
    }

    // Attente via observer + timeout
    return new Promise((resolve, reject) => {
      const t0 = performance.now();

      const timer = setTimeout(() => {
        obs.disconnect();
        reject(new Error('Timeout: .nav-links introuvable'));
      }, timeoutMs);

      const obs = new MutationObserver(() => {
        const found = document.querySelector('.nav-links');
        if (found) {
          clearTimeout(timer);
          obs.disconnect();
          log('waitForNavLinks() found via MutationObserver after ms=', Math.round(performance.now() - t0));
          log('navLinks details', describeElement(found));
          resolve(found);
        }
      });

      obs.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function ensureLogoutButton(navLinks, supabase) {
    log('ensureLogoutButton() ENTER', {
      navLinksType: navLinks?.constructor?.name,
      supabaseAuth: !!supabase?.auth,
      navLinks: describeElement(navLinks),
    });

    try {
      if (!navLinks || !(navLinks instanceof Element)) {
        throw new Error('navLinks invalide (pas un Element)');
      }

      // Vérifie si déjà présent
      const existing = navLinks.querySelector('[data-logout-btn="1"]');
      log('existing logout btn ?', !!existing);
      if (existing) {
        log('Bouton déjà présent, stop', describeElement(existing));
        return;
      }

      // Crée bouton
      const btn = document.createElement('a');
      btn.href = '#';
      btn.textContent = '🔒 Logout';
      btn.className = 'logout-btn';
      btn.setAttribute('data-logout-btn', '1');

      // Style très "agressif" pour éviter qu'un CSS externe le masque
      btn.style.setProperty('display', 'inline-flex', 'important');
      btn.style.setProperty('align-items', 'center', 'important');
      btn.style.setProperty('gap', '8px', 'important');
      btn.style.setProperty('margin-left', '10px', 'important');
      btn.style.setProperty('background', 'linear-gradient(135deg, #ef4444, #dc2626)', 'important');
      btn.style.setProperty('color', '#fff', 'important');
      btn.style.setProperty('padding', '8px 16px', 'important');
      btn.style.setProperty('border-radius', '8px', 'important');
      btn.style.setProperty('text-decoration', 'none', 'important');
      btn.style.setProperty('font-weight', '700', 'important');
      btn.style.setProperty('cursor', 'pointer', 'important');
      btn.style.setProperty('z-index', '99999', 'important');

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        log('Click -> signOut()');
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            err('signOut error', error);
            return;
          }
          log('signOut OK -> redirect index.html');
          window.location.href = './index.html';
        } catch (e2) {
          err('Exception dans handler click', e2);
        }
      });

      log('Avant appendChild: navLinks children=', navLinks.children.length);
      navLinks.appendChild(btn);
      log('Après appendChild: navLinks children=', navLinks.children.length);

      // Vérifs post-insertion
      const inserted = navLinks.querySelector('[data-logout-btn="1"]');
      log('Bouton inséré ?', !!inserted);
      if (!inserted) {
        warn('appendChild effectué mais querySelector ne retrouve pas le bouton -> DOM remplacé ?');
      } else {
        log('Bouton details', describeElement(inserted));

        // Vérifie s'il est hors écran / invisible
        const d = describeElement(inserted);
        if (d.rect.w === 0 || d.rect.h === 0) warn('Bouton a une taille nulle (CSS display/overflow/layout)');
        if (d.display === 'none' || d.visibility === 'hidden' || Number(d.opacity) === 0) warn('Bouton semble caché par CSS');
      }

      log('✅ Bouton ajouté au header');

    } catch (e) {
      err('ensureLogoutButton() FAILED', e);
      // Log DOM complet du nav pour debug
      try {
        err('navLinks outerHTML (tronc):', navLinks?.outerHTML?.slice(0, 500));
      } catch {}
    }
  }

  async function refreshUIFromSession(supabase) {
    log('refreshUIFromSession() ENTER');

    try {
      const navLinks = await waitForNavLinks();
      log('refreshUIFromSession() got navLinks');

      const res = await supabase.auth.getSession();
      log('getSession() raw result', res);

      const session = res?.data?.session;
      if (session?.user) {
        log('👤 Utilisateur connecté:', session.user.email);
        log('Calling ensureLogoutButton() now…');
        ensureLogoutButton(navLinks, supabase);
        log('Returned from ensureLogoutButton()');
      } else {
        log('Aucune session utilisateur -> pas de bouton');
      }
    } catch (e) {
      err('refreshUIFromSession() FAILED', e);
    }
  }

  function start(reason) {
    log('start()', { reason, hasSupabaseClient: !!window.supabaseClient });

    const supabase = window.supabaseClient;
    if (!supabase?.auth) {
      warn('supabaseClient.auth absent -> start abort');
      return;
    }

    refreshUIFromSession(supabase);

    // BONUS: si ton header est reconstruit après coup (SPA / scripts), on reteste
    setTimeout(() => {
      log('re-check after 1s (header might have been replaced)');
      refreshUIFromSession(supabase);
    }, 1000);

    setTimeout(() => {
      log('re-check after 3s');
      refreshUIFromSession(supabase);
    }, 3000);
  }

  // Démarrage
  if (window.supabaseClient?.auth) start('immediate');
  window.addEventListener('supabase:ready', () => start('event supabase:ready'));

})();
