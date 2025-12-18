// ======================================================================
// SCRIPT DE CHARGEMENT DES COMPOSANTS (à sauvegarder dans main.js)
// ======================================================================

document.addEventListener("DOMContentLoaded", function() {
    // --- 1. CHARGEMENT DU HEADER ---
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            // Insère le header dans le placeholder
            document.getElementById('header-placeholder').innerHTML = data;
            
            // --- 2. GESTION DU LIEN ACTIF ---
            // Récupère le nom de la page actuelle (ex: "index.html")
            const currentPage = window.location.pathname.split('/').pop();
            
            // Trouve le lien correspondant dans la nav
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop();
                
                // Si le lien correspond à la page actuelle, on lui ajoute la classe "active"
                if (linkPage === currentPage) {
                    link.classList.add('active');
                }
            });
        });

    // --- 3. CHARGEMENT DU FOOTER ---
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
});

// --- 4. SCRIPT DE LANGUE (si vous voulez le centraliser aussi) ---
function switchLanguage(lang) {
    document.querySelectorAll('[data-fr]').forEach(el => {
        const text = el.dataset[lang];
        if (text) {
            el.innerHTML = text;
        }
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
    localStorage.setItem('selectedLanguage', lang);
}

// Initialisation au chargement de la page
const savedLang = localStorage.getItem('selectedLanguage') || 'en';
// On attend un peu que le header soit chargé pour appliquer la langue
setTimeout(() => switchLanguage(savedLang), 100);
