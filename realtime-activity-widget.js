// ============================================
// WIDGET D'ACTIVITÉ EN TEMPS RÉEL - SUPABASE
// ============================================
// Version simple qui utilise vos vraies données Supabase

(function() {
  'use strict';

  // Configuration Supabase - ✅ VALEURS CORRIGÉES
  const SUPABASE_URL = 'https://oowazkyngsgwuswlhlzw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd2F6a3luZ3Nnd3Vzd2xobHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzAxMDUsImV4cCI6MjA3NzQwNjEwNX0.XKzrLhVVOrcMMMRC0Zpgd1iVbkgHGqpBcazf3-HWYpw';

  // Créer le client Supabase (utilise la librairie déjà chargée)
  let supabase;
  try {
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase SDK not loaded. Add script tag first.');
      return;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('❌ Erreur initialisation Supabase:', error);
    return;
  }

  // ============================================
  // 1. WIDGET D'ACTIVITÉ EN BAS À GAUCHE
  // ============================================

  function createActivityWidget() {
    // Vérifier que document.body existe
    if (!document.body) {
      console.warn('⚠️ document.body not ready yet, waiting...');
      return null;
    }
    
    const widget = document.createElement('div');
    widget.id = 'activity-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    document.body.appendChild(widget);
    return widget;
  }

  function showActivityNotification(activity) {
    const widget = document.getElementById('activity-widget') || createActivityWidget();
    
    // Si le widget n'a pas pu être créé (document.body pas prêt), attendre un peu
    if (!widget) {
      setTimeout(() => showActivityNotification(activity), 100);
      return;
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      margin-bottom: 10px;
      max-width: 300px;
      animation: slideInLeft 0.5s ease-out;
      font-size: 13px;
      line-height: 1.4;
    `;

    const emoji = activity.action_type === 'export' ? '🎨' : 
                  activity.action_type === 'signup' ? '👤' : '✨';

    const actionText = activity.action_type === 'export' ? 'vient d\'exporter une cover' :
                       activity.action_type === 'signup' ? 'vient de s\'inscrire' :
                       'utilise GabaritKDP';

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">${emoji}</span>
        <div>
          <div style="font-weight: 600;">${activity.user_name || 'Quelqu\'un'}</div>
          <div style="font-size: 12px; opacity: 0.9;">${actionText}</div>
          <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">
            ${activity.location || 'France'} • ${timeAgo(activity.created_at)}
          </div>
        </div>
      </div>
    `;

    widget.appendChild(notification);

    // Retirer après 6 secondes
    setTimeout(() => {
      notification.style.animation = 'slideOutLeft 0.5s ease-in';
      setTimeout(() => notification.remove(), 500);
    }, 6000);
  }

  // ============================================
  // 2. COMPTEUR DES 100 PLACES
  // ============================================

  async function updateBetaCounter() {
    try {
      // Compter les beta testers
      const { count, error } = await supabase
        .from('beta_testers')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      const remaining = Math.max(0, 100 - (count || 0));

      // Trouver les éléments du compteur dans le HTML
      const elements = [
        document.getElementById('spotsRemaining'),
        document.getElementById('slotsRemaining'),
        document.querySelector('[data-beta-count]'),
        ...document.querySelectorAll('*')
      ].filter(el => el && (
        el.textContent?.includes('/100') ||
        el.textContent?.includes('places restantes') ||
        el.textContent?.includes('spots left')
      ));

      elements.forEach(el => {
        if (el.id === 'spotsRemaining' || el.id === 'slotsRemaining') {
          el.textContent = remaining;
        } else if (el.textContent) {
          el.textContent = el.textContent.replace(/\d+\s*\/\s*100/, `${remaining} / 100`);
        }
      });

      console.log(`✅ Compteur mis à jour: ${remaining}/100 places`);
    } catch (error) {
      console.error('❌ Erreur compteur beta:', error);
    }
  }

  // ============================================
  // 3. RÉCUPÉRER LES ACTIVITÉS RÉCENTES
  // ============================================

  async function loadRecentActivities() {
    try {
      const { data, error } = await supabase
        .from('site_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        // Afficher les activités une par une avec un délai
        data.reverse().forEach((activity, index) => {
          setTimeout(() => {
            showActivityNotification(activity);
          }, index * 8000); // 8 secondes entre chaque
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement activités:', error);
    }
  }

  // ============================================
  // 4. ÉCOUTE EN TEMPS RÉEL (REALTIME)
  // ============================================

  function subscribeToActivities() {
    const channel = supabase
      .channel('site_activity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_activity'
        },
        (payload) => {
          console.log('🔴 Nouvelle activité:', payload.new);
          showActivityNotification(payload.new);
        }
      )
      .subscribe();

    console.log('✅ Abonnement temps réel activé');
    return channel;
  }

  function subscribeToBetaTesters() {
    const channel = supabase
      .channel('beta_testers_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'beta_testers'
        },
        (payload) => {
          console.log('🔴 Nouveau beta tester:', payload.new);
          updateBetaCounter();
        }
      )
      .subscribe();

    return channel;
  }

  // ============================================
  // 5. HELPERS
  // ============================================

  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  }

  // ============================================
  // 6. AJOUTER LES ANIMATIONS CSS
  // ============================================

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOutLeft {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-100px);
      }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #activity-widget {
        left: 10px;
        right: 10px;
        bottom: 10px;
      }
      
      #activity-widget > div {
        max-width: 100% !important;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // 7. FONCTION PUBLIQUE POUR ENREGISTRER ACTIVITÉ
  // ============================================

  window.trackActivity = async function(actionType, userName = null, location = null) {
    try {
      const { data, error } = await supabase
        .from('site_activity')
        .insert([
          {
            action_type: actionType,
            user_name: userName,
            location: location || 'France'
          }
        ]);

      if (error) throw error;
      console.log('✅ Activité enregistrée:', actionType);
    } catch (error) {
      console.error('❌ Erreur enregistrement activité:', error);
    }
  };

  // ============================================
  // 8. INITIALISATION
  // ============================================

  function init() {
    console.log('🚀 Initialisation widget activité temps réel...');

    // Vérifier que document.body est prêt
    if (!document.body) {
      console.warn('⚠️ document.body not ready, waiting...');
      setTimeout(init, 50);
      return;
    }

    // Créer le widget
    createActivityWidget();

    // Charger les activités récentes
    loadRecentActivities();

    // Mettre à jour le compteur
    updateBetaCounter();

    // S'abonner aux changements en temps réel
    subscribeToActivities();
    subscribeToBetaTesters();

    // Rafraîchir le compteur toutes les 30 secondes
    setInterval(updateBetaCounter, 30000);

    console.log('✅ Widget activité temps réel chargé');
  }

  // Attendre que le DOM soit chargé ET que Supabase soit disponible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Si le document est déjà chargé, attendre un tick pour s'assurer que body est prêt
    setTimeout(init, 0);
  }

})();
