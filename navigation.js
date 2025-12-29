// GabaritKDP - Centralized Navigation System
// This file manages the navigation menu for all pages

// Navigation configuration - Add/remove/reorder items here
const navigationConfig = {
  items: [
    {
      href: './index.html',
      icon: '🏠',
      textFr: 'Accueil',
      textEn: 'Home',
      id: 'home'
    },
    {
      href: './dashboard.html',
      icon: '📊',
      textFr: 'Tableau de bord',
      textEn: 'Dashboard',
      id: 'dashboard'
      // Dashboard is now always visible for all users
    },
    {
      href: './generator.html',
      icon: '',
      textFr: 'Générateur Express',
      textEn: 'Express Generator',
      id: 'generator-express',
      isExpress: true // Special styling for Express Generator - lightning bolt added by CSS
    },
    {
      href: './generator-magic.html',
      icon: '',
      textFr: 'Générateur Magique',
      textEn: 'Magic Generator',
      id: 'generator-magic'
    },
    {
      href: './marketplace.html',
      icon: '',
      textFr: 'Marketplace',
      textEn: 'Marketplace',
      id: 'marketplace'
    },
    {
      href: '#tarifs',
      icon: '💰',
      textFr: 'Tarifs',
      textEn: 'Pricing',
      id: 'pricing'
    },
    {
      href: './inscription.html',
      icon: '📝',
      textFr: 'Inscription',
      textEn: 'Sign Up',
      id: 'signup'
    },
    {
      href: './connexion.html',
      icon: '🔑',
      textFr: 'Connexion',
      textEn: 'Login',
      id: 'login'
    }
  ]
};

// Function to generate navigation HTML
function generateNavigation(currentPage) {
  const currentLang = localStorage.getItem('preferredLanguage') || 'en'; // Default to English
  
  // Desktop navigation
  let desktopNav = '';
  navigationConfig.items.forEach(item => {
    const text = currentLang === 'fr' ? item.textFr : item.textEn;
    const fullText = item.icon ? `${item.icon} ${text}` : text;
    const isActive = isCurrentPage(item.href, currentPage);
    const activeClass = isActive ? 'active' : '';
    
    if (item.isExpress) {
      desktopNav += `<a href="${item.href}" class="express-nav-btn ${activeClass}" data-fr="${item.icon} ${item.textFr}" data-en="${item.icon} ${item.textEn}">${fullText}</a>`;
    } else {
      desktopNav += `<a href="${item.href}" class="${activeClass}" data-fr="${item.icon} ${item.textFr}" data-en="${item.icon} ${item.textEn}">${fullText}</a>`;
    }
  });
  
  // Mobile navigation
  let mobileNav = '';
  navigationConfig.items.forEach(item => {
    const text = currentLang === 'fr' ? item.textFr : item.textEn;
    const fullText = item.icon ? `${item.icon} ${text}` : text;
    
    let style = '';
    if (item.isExpress) {
      style = 'style="background:linear-gradient(135deg,#10b981,#059669);border-color:#10b981;"';
    } else if (item.id === 'pricing') {
      style = 'style="background:rgba(251,191,36,.2);border-color:#fbbf24;"';
    } else if (item.id === 'signup') {
      style = 'style="background:rgba(34,197,94,.2);border-color:#22c55e;"';
    }
    
    mobileNav += `<a href="${item.href}" ${style} data-fr="${item.icon} ${item.textFr}" data-en="${item.icon} ${item.textEn}">${fullText}</a>`;
  });
  
  return { desktopNav, mobileNav };
}

// Helper function to check if current page
function isCurrentPage(href, currentPage) {
  if (!currentPage) return false;
  
  // Handle anchor links
  if (href.startsWith('#')) {
    return false;
  }
  
  // Extract filename from href
  const hrefFile = href.replace('./', '').split('#')[0];
  return currentPage.includes(hrefFile);
}

// Function to inject navigation into the page
function injectNavigation(currentPage = '') {
  const { desktopNav, mobileNav } = generateNavigation(currentPage);
  
  // Update desktop navigation
  const desktopNavElement = document.querySelector('.nav-links');
  if (desktopNavElement) {
    desktopNavElement.innerHTML = desktopNav;
  }
  
  // Update mobile navigation
  const mobileNavElement = document.querySelector('.mobile-menu-links');
  if (mobileNavElement) {
    mobileNavElement.innerHTML = mobileNav;
  }
}

// Auto-detect current page and inject navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname;
  injectNavigation(currentPage);
});

// Re-inject navigation when language changes
window.addEventListener('languageChanged', function() {
  const currentPage = window.location.pathname;
  injectNavigation(currentPage);
});
