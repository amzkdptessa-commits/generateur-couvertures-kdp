// ═══════════════════════════════════════════════════════════════
// MARKETPLACE CATEGORIES - GabaritKDP
// ═══════════════════════════════════════════════════════════════
// Toutes les catégories pour génération automatique du marketplace
// ═══════════════════════════════════════════════════════════════

const MARKETPLACE_CATEGORIES = {
  
  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: FULL COVER - Premium Edition
  // ═══════════════════════════════════════════════════════════════
  fullcover: [
    {
      name: "Art",
      icon: "🎨",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Art/STYLE%20PICASSO/fullcover_art_style_picasso_007.jpg",
      link: "/subcategory-full-cover-art.html",
      badge: "premium"
    },
    {
      name: "Boheme",
      icon: "🌸",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/BOHEME/Boheme_152.png",
      link: "/category-boheme.html"
    },
    {
      name: "FANTASY",
      icon: "🧙",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/FANTASY/EPIC%20FANTASY/fullcover_fantasy_epic_fantasy_030.jpg",
      link: "/category-fantasy.html",
      badge: "popular"
    },
    {
      name: "Fleurs",
      icon: "🌺",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Fleurs/fullcover_couverture_de_livres_fleurs_006.png",
      link: "/category-fleurs.html"
    },
    {
      name: "Historical",
      icon: "🏛️",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Historical/Historical/fullcover_couverture_de_livres_historical_013.jpg",
      link: "/category-historical.html"
    },
    {
      name: "Horror",
      icon: "👻",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Horror/Horror/fullcover_couverture_de_livres_horror_058.jpg",
      link: "/category-horror.html",
      badge: "new"
    },
    {
      name: "MAGIE x ART NOUVEAU (STYLE PREMIUM)",
      icon: "✨",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/MAGIE%20x%20ART%20NOUVEAU%20(STYLE%20PREMIUM)/Art%20Nouveau%20Bleu%20Nuit%20%26%20Or/fullcover_magie_x_art_nouveau_style_premium_art_nouveau_bleu_nuit_or_001.jpg",
      link: "/category-magie-x-art-nouveau-style-premium.html",
      badge: "premium"
    },
    {
      name: "Mystery",
      icon: "🔍",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/MYSTERY/Cozy%20Mystery/image_couverture_de_livres_mystery_cozy_mystery_001.png",
      link: "/category-mystery.html"
    },
    {
      name: "Paysages",
      icon: "🏞️",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Paysages/fullcover_couverture_de_livres_paysages_009.png",
      link: "/category-paysages.html",
      hidden: true
    },
    {
      name: "RELIGIONS",
      icon: "✝️",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/RELIGIONS/CHRISTIANISME/Style%20Louange%20%20Gospel/fullcover_religions_christianisme_style_louange_gospel_007.jpg",
      link: "/category-religions.html",
      badge: "premium",
      hidden: true
    },
    {
      name: "Romance",
      icon: "💖",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/vignette.webp",
      link: "/category-romance.html",
      badge: "best",
      hidden: true
    },
    {
      name: "Sci-fi",
      icon: "🚀",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Sci-fi/Sci-fi/fullcover_couverture_de_livres_sci_fi_001.jpg",
      link: "/category-sci-fi.html",
      badge: "popular",
      hidden: true
    },
    {
      name: "Thriller",
      icon: "🔪",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Thriller/Thriller/fullcover_couverture_de_livres_thriller_001.jpg",
      link: "/category-thriller.html",
      badge: "new",
      hidden: true
    },
    {
      name: "Vintage",
      icon: "📷",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Vintage/1930s%20Buildings%20%26%20City/fullcover_vintage_1930s_buildings_city_006.jpg",
      link: "/category-vintage.html",
      badge: "popular",
      hidden: true
    },
    {
      name: "Voyages",
      icon: "🌍",
      image: "https://gabaritkdp.b-cdn.net/FULL%20COVER/Voyages/MARRAKECH/fullcover_voyages_marrakech_017.jpg",
      link: "/category-voyages.html",
      badge: "new",
      hidden: true
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: BOOK COVERS (Backgrounds)
  // ═══════════════════════════════════════════════════════════════
  bookcovers: [
    {
      name: "Romance",
      icon: "💕",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/ROMANCE/DARK%20ROMANCE/Dark%20romance/image_couverture_de_livres_romance_dark_romance_002.png",
      link: "/category-romance.html",
      badge: "popular"
    },
    {
      name: "Thriller",
      icon: "🔪",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/THRILLER/THRILLER%20%E2%80%93%20NOIR/image_couverture_de_livres_thriller_thriller_noir_012.png",
      link: "/category-thriller.html",
      badge: "new"
    },
    {
      name: "Fantasy",
      icon: "🐉",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/FANTASY/DARK%20FANTASY/image_couverture_de_livres_fantasy_dark_fantasy_006.png",
      link: "/category-fantasy.html"
    },
    {
      name: "Mystery",
      icon: "🔍",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/MYSTERY/Cozy%20Mystery/Cozy%20Mystery/image_couverture_de_livres_mystery_cozy_mystery_004.png",
      link: "/category-mystery.html"
    },
    {
      name: "Science-Fiction",
      icon: "🚀",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/SCI-FI/TECH%20ROMANCE%20%20AI/image_couverture_de_livres_sci_fi_tech_romance_ai_001.png",
      link: "/category-scifi.html",
      badge: "new"
    },
    {
      name: "Historical",
      icon: "🏰",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/HISTORICAL/Medieval/Medieval/image_couverture_de_livres_historical_medieval_010.png",
      link: "/category-historical.html"
    },
    {
      name: "Bohème",
      icon: "🌸",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/BOHEME/BOHEME/Boheme_270.png",
      link: "/category-boheme.html",
      badge: "new"
    },
    {
      name: "Hippie",
      icon: "☮️",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/HIPPIE/image_couverture_de_livres_hippie_001.png",
      link: "/category-hippie.html"
    },
    {
      name: "Business",
      icon: "💼",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/BUSINESS/Entrepreneurship/image_couverture_de_livres_business_entrepreneurship_011.png",
      link: "/category-business.html",
      hidden: true
    },
    {
      name: "Cartoon",
      icon: "🎬",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/CARTOON/Animaux%20cartoon/image_couverture_de_livres_cartoon_animaux_cartoon_001.png",
      link: "/category-cartoon.html",
      hidden: true
    },
    {
      name: "Horror",
      icon: "👻",
      image: "",
      link: "/category-horror.html",
      gradient: "linear-gradient(135deg, #991b1b, #7f1d1d)",
      hidden: true
    },
    {
      name: "Landscapes",
      nameFr: "Paysages",
      icon: "🏞️",
      image: "",
      link: "/category-paysages.html",
      gradient: "linear-gradient(135deg, #065f46, #064e3b)",
      hidden: true
    },
    {
      name: "Flowers",
      nameFr: "Fleurs",
      icon: "🌹",
      image: "",
      link: "/category-fleurs.html",
      gradient: "linear-gradient(135deg, #be185d, #9f1239)",
      hidden: true
    },
    {
      name: "Art",
      icon: "🎨",
      image: "",
      link: "/category-art.html",
      gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)",
      hidden: true
    },
    {
      name: "Animals",
      nameFr: "Animaux",
      icon: "🦁",
      image: "https://gabaritkdp.b-cdn.net/backgrounds/ANIMAUX/Loups/Loups/image_couverture_de_livres_animaux_loups_004.png",
      link: "/category-animaux.html",
      hidden: true
    },
    {
      name: "Religions",
      icon: "✝️",
      image: "",
      link: "/category-religions.html",
      gradient: "linear-gradient(135deg, #0284c7, #0369a1)",
      hidden: true
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: BOOK INTERIORS
  // ═══════════════════════════════════════════════════════════════
  bookinteriors: [
    {
      name: "Planners",
      icon: "📅",
      image: "https://gabaritkdp.b-cdn.net/UI/book-interiors/Vignettes%20PLANNERS%202026.png",
      link: "/category-planners.html",
      description: "2026 Planners & Organizers"
    },
    {
      name: "Coloring Books",
      nameFr: "Livres de Coloriage",
      icon: "🎨",
      image: "https://gabaritkdp.b-cdn.net/UI/book-interiors/Vignettes%20COLORIAGES.png",
      link: "/category-coloriages.html",
      description: "Adult & Kids Coloring Books"
    }
  ]
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateCategoryCard(category, onclick = true) {
  const badgeHtml = category.badge ? 
    `<span class="category-badge badge-${category.badge}">${category.badge.toUpperCase()}</span>` : '';
  
  const hiddenClass = category.hidden ? ' d_hidden' : '';
  
  const imageHtml = category.image ? 
    `<img src="${category.image}" alt="${category.name}" loading="lazy">` : '';
  
  const styleAttr = category.gradient ? 
    `style="background:${category.gradient};"` : '';
  
  const onclickAttr = onclick ? 
    `onclick="location.href='${category.link}'" ontouchstart=""` : '';
  
  const displayName = category.nameFr ? 
    `<span class="category-name" data-fr="${category.nameFr}" data-en="${category.name}">${category.name}</span>` :
    `<span class="category-name">${category.name}</span>`;
  
  return `
    <div class="category-card${hiddenClass}" ${onclickAttr} ${styleAttr}>
      ${imageHtml}
      ${badgeHtml}
      <div class="category-overlay">
        <span class="category-icon">${category.icon}</span>
        ${displayName}
        <span class="category-count">Explore templates →</span>
      </div>
    </div>
  `;
}

function renderFullCoverSection() {
  const container = document.getElementById('fullcover-categories');
  if (!container) return;
  
  container.innerHTML = MARKETPLACE_CATEGORIES.fullcover
    .map(cat => generateCategoryCard(cat))
    .join('');
}

function renderBookCoversSection() {
  const container = document.getElementById('SecondCoverSection');
  if (!container) return;
  
  container.innerHTML = MARKETPLACE_CATEGORIES.bookcovers
    .map(cat => generateCategoryCard(cat))
    .join('');
}

function renderBookInteriorsSection() {
  const container = document.getElementById('book-interiors-grid');
  if (!container) return;
  
  const html = MARKETPLACE_CATEGORIES.bookinteriors.map(cat => {
    const displayName = cat.nameFr ? 
      `<span data-fr="${cat.nameFr}" data-en="${cat.name}">${cat.name}</span>` :
      cat.name;
    
    return `
      <div class="category-card" onclick="location.href='${cat.link}'">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        <div class="category-overlay">
          <span class="category-icon">${cat.icon}</span>
          <span class="category-name">${displayName}</span>
          <span class="category-count">${cat.description || 'Explore templates →'}</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// AUTO-LOAD ON PAGE READY
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎨 Marketplace Categories - Loading...');
  
  renderFullCoverSection();
  renderBookCoversSection();
  renderBookInteriorsSection();
  
  console.log('✅ Marketplace Categories - Loaded!');
});
