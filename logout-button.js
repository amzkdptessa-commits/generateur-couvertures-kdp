// Utilisation d'un sélecteur plus précis pour éviter de scanner tout le DOM
const updateUIElements = (isLoggedIn) => {
    // On cible uniquement les éléments avec les classes spécifiques
    const authElements = document.querySelectorAll('.auth-required');
    const guestElements = document.querySelectorAll('.guest-only');

    authElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });

    guestElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
};

async function checkLoginStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const isLoggedIn = !!session;
        
        updateUIElements(isLoggedIn);

        if (isLoggedIn) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const userEmailElem = document.getElementById('user-email');
                if (userEmailElem) userEmailElem.textContent = user.email;
            }
        }
    } catch (error) {
        console.error('Erreur checkLoginStatus:', error);
    }
}

// Gestion de la déconnexion
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert("Erreur lors de la déconnexion");
    } else {
        window.location.href = 'index.html';
    }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', checkLoginStatus);