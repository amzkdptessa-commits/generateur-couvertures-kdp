// ============================================
// SYSTÈME ULTRA-SIMPLE - GABARITKDP
// VERSION CONFIGURÉE AVEC VOS CLÉS
// ============================================

class SimpleExportSystem {
    constructor() {
        // ✅ CONFIGURATION SUPABASE (VOS VRAIES CLÉS)
        this.supabaseUrl = 'https://kucwdaicplajljpfkzhu.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Y3dkYWljcGxhamxqcGZremh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzMxMjQsImV4cCI6MjA3NzUwOTEyNH0.0IDHysD84_0ghjb-a4K0UkNrJbzdQBKUjm5mQbSfro8';
        
        // Créer le client Supabase
        this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
        
        // ✅ LIENS DE PAIEMENT STRIPE (VOS VRAIS LIENS)
        this.stripeLinks = {
            payPerExport: 'https://buy.stripe.com/8x228rd9b071c8afE5gUM01',
            pro: 'https://buy.stripe.com/cN17sLg1n2f9fkmeA1gUM03'
        };
        
        this.currentUser = null;
        
        console.log('✅ Système d\'exports initialisé avec vos clés');
    }

    // ============================================
    // CONNEXION
    // ============================================
    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email, 
                password
            });
            
            if (error) {
                console.error('Erreur connexion:', error);
                alert('Erreur de connexion : ' + error.message);
                return false;
            }
            
            this.currentUser = data.user;
            console.log('✅ Connecté:', email);
            return true;
        } catch (err) {
            console.error('Erreur connexion:', err);
            alert('Erreur de connexion');
            return false;
        }
    }

    // ============================================
    // INSCRIPTION
    // ============================================
    async signUp(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email, 
                password
            });
            
            if (error) {
                console.error('Erreur inscription:', error);
                alert('Erreur d\'inscription : ' + error.message);
                return false;
            }
            
            console.log('✅ Compte créé:', email, '→ 3 exports gratuits');
            alert('✅ Compte créé avec succès ! Vérifiez votre email pour confirmer.');
            return true;
        } catch (err) {
            console.error('Erreur inscription:', err);
            alert('Erreur d\'inscription');
            return false;
        }
    }

    // ============================================
    // DÉCONNEXION
    // ============================================
    async signOut() {
        try {
            await this.supabase.auth.signOut();
            this.currentUser = null;
            console.log('✅ Déconnecté');
            window.location.href = '/index.html';
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        }
    }

    // ============================================
    // VÉRIFIER SI L'USER PEUT EXPORTER
    // ============================================
    async canExport() {
        // Vérifier si connecté
        if (!this.currentUser) {
            alert('⚠️ Connectez-vous pour exporter !');
            window.location.href = '/connexion.html';
            return false;
        }

        try {
            // Récupérer le profil
            const { data: profile, error } = await this.supabase
                .from('user_profiles')
                .select('exports_available, is_pro, email')
                .eq('id', this.currentUser.id)
                .single();

            if (error) {
                console.error('Erreur récupération profil:', error);
                return false;
            }

            if (!profile) {
                console.error('Profil introuvable');
                return false;
            }

            console.log('📊 Profil:', {
                email: profile.email,
                exports_available: profile.exports_available,
                is_pro: profile.is_pro
            });

            // Si Pro = exports illimités
            if (profile.is_pro) {
                console.log('🚀 User Pro → Exports illimités');
                return true;
            }

            // Si exports disponibles > 0
            if (profile.exports_available > 0) {
                console.log(`✅ ${profile.exports_available} export(s) disponible(s)`);
                return true;
            }

            // Sinon, proposer d'acheter
            console.log('❌ Plus d\'exports disponibles');
            this.showBuyModal();
            return false;

        } catch (err) {
            console.error('Erreur canExport:', err);
            return false;
        }
    }

    // ============================================
    // UTILISER UN EXPORT
    // ============================================
    async useExport() {
        if (!this.currentUser) return false;

        try {
            // Récupérer le profil
            const { data: profile, error: fetchError } = await this.supabase
                .from('user_profiles')
                .select('is_pro, exports_available')
                .eq('id', this.currentUser.id)
                .single();

            if (fetchError) {
                console.error('Erreur récupération profil:', fetchError);
                return false;
            }

            // Si Pro = pas de déduction
            if (profile.is_pro) {
                console.log('✅ Export Pro (illimité)');
                return true;
            }

            // Déduire 1 export
            const { error: updateError } = await this.supabase
                .from('user_profiles')
                .update({ 
                    exports_available: profile.exports_available - 1,
                    total_exports_used: profile.total_exports_used + 1
                })
                .eq('id', this.currentUser.id);

            if (updateError) {
                console.error('Erreur mise à jour exports:', updateError);
                return false;
            }

            console.log(`✅ Export utilisé. Restants : ${profile.exports_available - 1}`);
            return true;

        } catch (err) {
            console.error('Erreur useExport:', err);
            return false;
        }
    }

    // ============================================
    // AFFICHER MODAL D'ACHAT
    // ============================================
    showBuyModal() {
        // Supprimer un éventuel modal existant
        const existing = document.getElementById('buyModal');
        if (existing) existing.remove();

        const modal = `
            <div id="buyModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                 background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; text-align: center;">
                    <h2 style="font-size: 28px; margin-bottom: 20px;">Plus d'exports disponibles ! 🎯</h2>
                    <p style="margin-bottom: 30px; color: #666; font-size: 16px;">
                        Choisissez votre option pour continuer :
                    </p>
                    
                    <button onclick="exportSystem.buyOneExport()" 
                            style="width: 100%; padding: 15px; margin-bottom: 15px; background: #10b981; 
                                   color: white; border: none; border-radius: 10px; font-size: 18px; 
                                   font-weight: 600; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.background='#059669'"
                            onmouseout="this.style.background='#10b981'">
                        💳 Acheter 1 export (2,50 €)
                    </button>
                    
                    <button onclick="exportSystem.subscribePro()" 
                            style="width: 100%; padding: 15px; margin-bottom: 15px; background: #FF9900; 
                                   color: white; border: none; border-radius: 10px; font-size: 18px; 
                                   font-weight: 600; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.background='#e68900'"
                            onmouseout="this.style.background='#FF9900'">
                        🚀 Passer Pro Illimité (19,99 €/mois)
                    </button>
                    
                    <button onclick="document.getElementById('buyModal').remove()" 
                            style="width: 100%; padding: 10px; background: transparent; 
                                   border: 1px solid #ccc; border-radius: 10px; cursor: pointer;
                                   font-size: 14px; color: #666;">
                        Annuler
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // ============================================
    // ACHETER 1 EXPORT (Stripe Payment Link)
    // ============================================
    buyOneExport() {
        console.log('🛒 Redirection vers Stripe (Pay-per-Export)...');
        window.location.href = this.stripeLinks.payPerExport;
    }

    // ============================================
    // S'ABONNER PRO (Stripe Payment Link)
    // ============================================
    subscribePro() {
        console.log('🛒 Redirection vers Stripe (Pro Unlimited)...');
        window.location.href = this.stripeLinks.pro;
    }

    // ============================================
    // OBTENIR LES INFOS UTILISATEUR
    // ============================================
    async getUserInfo() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) {
                console.error('Erreur getUserInfo:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Erreur getUserInfo:', err);
            return null;
        }
    }

    // ============================================
    // AFFICHER LES INFOS DANS LA PAGE
    // ============================================
    async displayUserInfo() {
        const info = await this.getUserInfo();
        if (!info) return;

        console.log('👤 Infos utilisateur:', {
            email: info.email,
            exports_available: info.exports_available,
            is_pro: info.is_pro,
            total_exports_used: info.total_exports_used
        });

        // Afficher dans l'interface si élément existe
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl) {
            userInfoEl.innerHTML = `
                <div style="padding: 15px; background: #f0f9ff; border-radius: 10px; margin: 10px 0;">
                    <p><strong>Email:</strong> ${info.email}</p>
                    <p><strong>Exports disponibles:</strong> ${info.is_pro ? '∞ (Pro)' : info.exports_available}</p>
                    <p><strong>Total utilisés:</strong> ${info.total_exports_used}</p>
                </div>
            `;
        }
    }
}

// ============================================
// INSTANCE GLOBALE
// ============================================
const exportSystem = new SimpleExportSystem();

// ============================================
// FONCTION POUR EXPORTER (à utiliser dans generator.html)
// ============================================
async function exportCover() {
    console.log('🎨 Tentative d\'export...');
    
    // 1. Vérifier si l'user peut exporter
    const canExport = await exportSystem.canExport();
    
    if (!canExport) {
        console.log('❌ Export refusé (pas assez de crédits)');
        return; // Modal d'achat s'affiche automatiquement
    }

    // 2. Utiliser un export
    const used = await exportSystem.useExport();
    
    if (!used) {
        alert('❌ Erreur lors de l\'utilisation de l\'export');
        return;
    }

    // 3. VOTRE CODE DE GÉNÉRATION DE COVER ICI
    // ==========================================
    console.log('🎨 Génération de la cover...');
    
    // ... votre code existant pour générer la cover ...
    // Par exemple : generatePDF(), downloadCover(), etc.
    
    // ==========================================

    alert('✅ Cover exportée avec succès !');
}

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation du système d\'exports...');
    
    // Vérifier si l'user est connecté
    const { data: { user }, error } = await exportSystem.supabase.auth.getUser();
    
    if (error) {
        console.error('Erreur vérification user:', error);
    }
    
    if (user) {
        exportSystem.currentUser = user;
        console.log('👤 User connecté:', user.email);
        
        // Afficher les infos
        await exportSystem.displayUserInfo();
    } else {
        console.log('👤 Pas d\'utilisateur connecté');
    }
    
    console.log('✅ Système prêt !');
});

// ============================================
// GESTION DU RETOUR STRIPE (success)
// ============================================
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('success') === 'export') {
        alert('✅ Paiement réussi ! Votre export a été ajouté à votre compte.');
        console.log('💰 Paiement Pay-per-Export confirmé');
    }
    
    if (urlParams.get('success') === 'pro') {
        alert('✅ Bienvenue dans Pro Unlimited ! Exports illimités activés 🚀');
        console.log('💰 Abonnement Pro confirmé');
    }
});
