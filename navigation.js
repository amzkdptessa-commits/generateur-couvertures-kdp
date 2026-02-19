// GabaritKDP - Centralized Navigation System
const navigationConfig = {
  items: [
    { href: '/index.html', icon: '🏠', textFr: 'Accueil', textEn: 'Home', id: 'home' },
    { href: '/dashboard.html', icon: '📊', textFr: 'Tableau de bord', textEn: 'Dashboard', id: 'dashboard' },
    { href: '/generator.html', icon: '', textFr: 'Générateur Express', textEn: 'Express Generator', id: 'generator-express', isExpress: true },
    { href: '/generator-magic.html', icon: '🪄', textFr: 'Générateur Magique', textEn: 'Magic Generator', id: 'generator-magic' },
    { href: '/marketplace.html', icon: '📚', textFr: 'Templates', textEn: 'Templates', id: 'marketplace' },
    { href: '#tarifs', icon: '💰', textFr: 'Tarifs', textEn: 'Pricing', id: 'pricing' },
    { href: '/inscription.html', icon: '📝', textFr: 'Inscription', textEn: 'Sign Up', id: 'signup' },
    { href: '/connexion.html', icon: '🔑', textFr: 'Connexion', textEn: 'Login', id: 'login' }
  ]
};

function generateNavigation(currentPage) {
  const currentLang = localStorage.getItem('preferredLanguage') || 'en';
  let desktopNav = '';
  navigationConfig.items.forEach(item => {
    const text = currentLang === 'fr' ? item.textFr : item.textEn;
    const fullText = item.icon ? `${item.icon} ${text}` : text;
    const isActive = currentPage.includes(item.href.replace('/', '').split('#')[0]);
    const activeClass = isActive ? 'active' : '';
    if (item.isExpress) {
      desktopNav += `<a href="${item.href}" class="express-nav-btn ${activeClass}">${fullText}</a>`;
    } else {
      desktopNav += `<a href="${item.href}" class="${activeClass}">${fullText}</a>`;
    }
  });
  return { desktopNav };
}

function injectNavigation(currentPage = '') {
  const { desktopNav } = generateNavigation(currentPage);
  const navElement = document.querySelector('.nav-links');
  if (navElement) navElement.innerHTML = desktopNav;
}

document.addEventListener('DOMContentLoaded', function() {
  injectNavigation(window.location.pathname);
});