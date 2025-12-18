// logout-button.js - Système de déconnexion global pour GabaritKDP

(function() {
    'use strict';
    
    // Attendre que Supabase soit chargé
    function waitForSupabase(callback) {
        if (window.supabase && window.supabaseClient) {
            callback();
        } else {
            setTimeout(() => waitForSupabase(callback), 100);
        }
    }
    
    // Créer le bouton de déconnexion
    function createLogoutButton() {
        waitForSupabase(async () => {
            const supabase = window.supabaseClient;
            
            // Vérifier si l'utilisateur est connecté
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
                console.log('👤 [LOGOUT] Utilisateur connecté:', session.user.email);
                
                // Trouver le header nav
                const navLinks = document.querySelector('.nav-links');
                
                if (navLinks) {
                    // Supprimer les liens Login et Sign Up
                    const loginLink = navLinks.querySelector('[href*="connexion"]');
                    const signupLink = navLinks.querySelector('[href*="inscription"]');
                    
                    if (loginLink) loginLink.style.display = 'none';
                    if (signupLink) signupLink.style.display = 'none';
                    
                    // Créer le bouton de déconnexion
                    const logoutBtn = document.createElement('a');
                    logoutBtn.href = '#';
                    logoutBtn.className = 'logout-btn';
                    logoutBtn.style.cssText = `
                        background: linear-gradient(135deg, #ef4444, #dc2626);
                        color: white;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    `;
                    logoutBtn.setAttribute('data-fr', '🔒 Déconnexion');
                    logoutBtn.setAttribute('data-en', '🔒 Logout');
                    logoutBtn.textContent = '🔒 Logout';
                    
                    // Ajouter l'effet hover
                    logoutBtn.addEventListener('mouseenter', () => {
                        logoutBtn.style.transform = 'translateY(-2px)';
                        logoutBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                    });
                    
                    logoutBtn.addEventListener('mouseleave', () => {
                        logoutBtn.style.transform = 'translateY(0)';
                        logoutBtn.style.boxShadow = 'none';
                    });
                    
                    // Gérer le clic sur déconnexion
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        logoutBtn.textContent = '⏳ ...';
                        logoutBtn.style.pointerEvents = 'none';
                        
                        const { error } = await supabase.auth.signOut();
                        
                        if (error) {
                            console.error('❌ [LOGOUT] Erreur:', error);
                            alert('Error logging out. Please try again.');
                            logoutBtn.textContent = '🔒 Logout';
                            logoutBtn.style.pointerEvents = 'auto';
                        } else {
                            console.log('✅ [LOGOUT] Déconnexion réussie');
                            // Rediriger vers la page d'accueil
                            window.location.href = './index.html';
                        }
                    });
                    
                    // Ajouter le bouton au nav
                    navLinks.appendChild(logoutBtn);
                    
                    // Afficher l'email de l'utilisateur (optionnel)
                    const userEmailDisplay = document.createElement('span');
                    userEmailDisplay.style.cssText = `
                        color: #cbd5e1;
                        font-size: 0.875rem;
                        margin-right: 12px;
                    `;
                    userEmailDisplay.textContent = session.user.email;
                    navLinks.insertBefore(userEmailDisplay, logoutBtn);
                }
            } else {
                console.log('👤 [LOGOUT] Pas d\'utilisateur connecté');
            }
        });
    }
    
    // Initialiser au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLogoutButton);
    } else {
        createLogoutButton();
    }
})();
