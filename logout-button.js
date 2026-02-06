/**
 * GABARIT KDP - Script de gestion de session optimisé
 * Supprime les tâches longues et corrige les erreurs de chargement Supabase
 */

(function() {
    'use strict';

    // Mise à jour de l'interface selon l'état de connexion
    const updateUIElements = (isLoggedIn, userEmail = '') => {
        const authElements = document.querySelectorAll('.auth-required');
        const guestElements = document.querySelectorAll('.guest-only');
        const userEmailElem = document.getElementById('user-email');

        authElements.forEach(el => el.style.display = isLoggedIn ? 'block' : 'none');
        guestElements.forEach(el => el.style.display = isLoggedIn ? 'none' : 'block');
        
        if (isLoggedIn && userEmailElem && userEmail) {
            userEmailElem.textContent = userEmail;
        }
    };

    async function checkLoginStatus() {
        // 🛡️ SÉCURITÉ : On vérifie si Supabase est bien chargé
        const supabase = window.supabaseClient;
        
        if (!supabase || !supabase.auth) {
            // Si pas prêt, on réessaie une seule fois après 500ms sans bloquer le thread
            setTimeout(checkLoginStatus, 500);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const isLoggedIn = !!session;

            if (isLoggedIn && session.user) {
                updateUIElements(true, session.user.email);
            } else {
                updateUIElements(false);
            }
        } catch (error) {
            console.error('Logout script error:', error);
        }
    }

    // Fonction de déconnexion globale
    window.handleLogout = async function() {
        const supabase = window.supabaseClient;
        if (!supabase) return;

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.location.href = 'index.html';
        } catch (error) {
            alert("Erreur lors de la déconnexion");
            console.error(error);
        }
    };

    // Lancement au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkLoginStatus);
    } else {
        checkLoginStatus();
    }
})();