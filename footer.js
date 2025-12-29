// GabaritKDP - Centralized Footer System
// This file manages the footer for all pages

// Footer configuration
const footerConfig = {
  // Social media links
  social: {
    titleFr: '🚀 Suivez-nous pour les dernières actualités KDP !',
    titleEn: '🚀 Follow us for the latest KDP news!',
    subtitleFr: 'Astuces KDP • Tutoriels • Actualités • Communauté d\'auteurs',
    subtitleEn: 'KDP Tips • Tutorials • News • Authors Community',
    links: [
      { platform: 'youtube', url: 'https://www.youtube.com/@Gabaritkdp', icon: 'fab fa-youtube', title: 'YouTube - Tutoriels KDP' },
      { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=61578785408904', icon: 'fab fa-facebook-f', title: 'Facebook - Communauté auteurs' },
      { platform: 'instagram', url: 'https://www.instagram.com/gabaritkdp/', icon: 'fab fa-instagram', title: 'Instagram - Inspirations couvertures' },
      { platform: 'pinterest', url: 'https://fr.pinterest.com/gabaritkdp/', icon: 'fab fa-pinterest-p', title: 'Pinterest - Designs couvertures' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@gabaritkdp', icon: 'fab fa-tiktok', title: 'TikTok - Tips rapides KDP' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/gabarit-kdp-073368378/', icon: 'fab fa-linkedin-in', title: 'LinkedIn - Publishers & Agences' }
    ]
  },
  
  // Footer columns
  columns: [
    {
      titleFr: 'Produit',
      titleEn: 'Product',
      links: [
        { href: './dashboard.html', textFr: 'Tableau de bord', textEn: 'Dashboard' },
        { href: './generator.html', textFr: 'Générateur Express', textEn: 'Express Generator', isExpress: true },
        { href: './generator-magic.html', textFr: 'Générateur Magique', textEn: 'Magic Generator' },
        { href: './marketplace.html', textFr: 'Marketplace', textEn: 'Marketplace' },
        { href: '#tarifs', textFr: 'Tarifs', textEn: 'Pricing' },
        { href: './fonctionnalites.html', textFr: 'Fonctionnalités', textEn: 'Features' }
      ]
    },
    {
      titleFr: 'Support',
      titleEn: 'Support',
      links: [
        { href: './api-pro.html', textFr: 'API', textEn: 'API' },
        { href: './faq.html', textFr: 'FAQ', textEn: 'FAQ' },
        { href: './contact.html', textFr: 'Contact', textEn: 'Contact' },
        { href: './guide.html', textFr: 'Guide utilisateur', textEn: 'User Guide' },
        { href: './updates.html', textFr: 'Mises à jour / Nouveautés', textEn: 'Updates / What\'s New' }
      ]
    },
    {
      titleFr: 'Légal',
      titleEn: 'Legal',
      links: [
        { href: './mentions-legales.html', textFr: 'Mentions légales', textEn: 'Legal Notice' },
        { href: './cgu.html', textFr: 'Conditions d\'utilisation', textEn: 'Terms of Use' },
        { href: './confidentialite.html', textFr: 'Politique de confidentialité', textEn: 'Privacy Policy' }
      ]
    }
  ],
  
  // Company info
  company: {
    name: 'GabaritKDP',
    logo: 'logo-gabarit-kdp-site-web.png',
    descriptionFr: 'Le générateur de couvertures KDP 100% conformes Amazon.',
    descriptionEn: 'The 100% Amazon-compliant KDP cover generator.',
    copyrightFr: '© 2025 GabaritKDP. Tous droits réservés.',
    copyrightEn: '© 2025 GabaritKDP. All rights reserved.'
  }
};

// Function to generate footer HTML
function generateFooter() {
  const currentLang = localStorage.getItem('preferredLanguage') || 'en'; // Default to English
  
  // Social section
  const socialTitle = currentLang === 'fr' ? footerConfig.social.titleFr : footerConfig.social.titleEn;
  const socialSubtitle = currentLang === 'fr' ? footerConfig.social.subtitleFr : footerConfig.social.subtitleEn;
  
  let socialLinksHTML = '';
  footerConfig.social.links.forEach(link => {
    socialLinksHTML += `
      <a href="${link.url}" class="social-link ${link.platform}" title="${link.title}" target="_blank" rel="noopener noreferrer">
        <i class="${link.icon}"></i>
      </a>`;
  });
  
  const socialSectionHTML = `
    <div class="social-section">
      <h4 class="text-white font-semibold mb-4 text-center" data-fr="${footerConfig.social.titleFr}" data-en="${footerConfig.social.titleEn}">${socialTitle}</h4>
      <div class="social-links">${socialLinksHTML}</div>
      <p class="text-center text-sm text-gray-400 mt-4" data-fr="${footerConfig.social.subtitleFr}" data-en="${footerConfig.social.subtitleEn}">${socialSubtitle}</p>
    </div>`;
  
  // Company section
  const companyDescription = currentLang === 'fr' ? footerConfig.company.descriptionFr : footerConfig.company.descriptionEn;
  const companySectionHTML = `
    <div>
      <div class="flex items-center mb-4">
        <img src="${footerConfig.company.logo}" alt="${footerConfig.company.name}" class="h-8 w-auto">
        <span class="ml-2 text-white font-bold">${footerConfig.company.name}</span>
      </div>
      <p class="text-gray-400" data-fr="${footerConfig.company.descriptionFr}" data-en="${footerConfig.company.descriptionEn}">${companyDescription}</p>
    </div>`;
  
  // Columns
  let columnsHTML = '';
  footerConfig.columns.forEach(column => {
    const columnTitle = currentLang === 'fr' ? column.titleFr : column.titleEn;
    
    let linksHTML = '';
    column.links.forEach(link => {
      const linkText = currentLang === 'fr' ? link.textFr : link.textEn;
      const expressClass = link.isExpress ? 'f-exp-gene' : '';
      const marginStyle = link.isExpress ? 'style="margin-bottom: 10px;"' : '';
      
      linksHTML += `
        <li ${marginStyle}>
          <a href="${link.href}" class="hover:text-white transition ${expressClass}" data-fr="${link.textFr}" data-en="${link.textEn}">${linkText}</a>
        </li>`;
    });
    
    columnsHTML += `
      <div>
        <h4 class="text-white font-semibold mb-4" data-fr="${column.titleFr}" data-en="${column.titleEn}">${columnTitle}</h4>
        <ul class="space-y-2">${linksHTML}</ul>
      </div>`;
  });
  
  // Copyright
  const copyright = currentLang === 'fr' ? footerConfig.company.copyrightFr : footerConfig.company.copyrightEn;
  const copyrightHTML = `
    <div class="border-t border-gray-800 mt-8 pt-8 text-center">
      <p data-fr="${footerConfig.company.copyrightFr}" data-en="${footerConfig.company.copyrightEn}">${copyright}</p>
    </div>`;
  
  // Complete footer
  return `
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${socialSectionHTML}
        <div class="grid md:grid-cols-4 gap-8">
          ${companySectionHTML}
          ${columnsHTML}
        </div>
        ${copyrightHTML}
      </div>
    </footer>`;
}

// Function to inject footer into the page
function injectFooter() {
  const footerElement = document.getElementById('footer-placeholder');
  if (footerElement) {
    footerElement.innerHTML = generateFooter();
  }
}

// Auto-inject footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure navigation.js has loaded first
  setTimeout(injectFooter, 100);
});

// Re-inject footer when language changes
window.addEventListener('languageChanged', function() {
  injectFooter();
});
