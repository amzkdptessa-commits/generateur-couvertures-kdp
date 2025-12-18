#!/usr/bin/env python3
"""
🎯 GÉNÉRATEUR AUTOMATIQUE DE PAGES MARKETPLACE
================================================
Génère toutes les pages de galerie en analysant gallery.json

Usage:
  python3 generate_all_galleries.py

Output:
  Toutes les pages HTML dans ./generated_pages/
"""

import json
import re
from collections import defaultdict
from pathlib import Path

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION DES ICÔNES PAR CATÉGORIE
# ═══════════════════════════════════════════════════════════════

CATEGORY_ICONS = {
    # ANIMAUX
    "ANIMAUX": {
        "Loups": "🐺",
        "Feerique": "🦄", 
        "Chats": "🐱",
        "Renards": "🦊",
        "Oiseaux": "🦅",
        "Chevaux": "🐴",
        "default": "🦊"
    },
    
    # ROMANCE
    "ROMANCE": {
        "Contemporary": "💕",
        "Dark Romance": "🖤",
        "Paranormal Romance": "🌙",
        "Romantic Suspense": "💔",
        "Highland": "🏴",
        "Sunset": "🌅",
        "Black Love": "💜",
        "default": "❤️"
    },
    
    # THRILLER
    "THRILLER": {
        "Crime": "🔪",
        "Thriller Noir": "🕵️",
        "Thriller Psychologique": "🧠",
        "Thriller Suspense": "😱",
        "default": "🔦"
    },
    
    # SCI-FI
    "SCI-FI": {
        "Cyberpunk": "🤖",
        "Dystopia": "🌆",
        "Space Opera": "🚀",
        "Tech Romance AI": "💻",
        "Black Futurism": "✨",
        "default": "🌌"
    },
    
    # FANTASY
    "FANTASY": {
        "Urban Fantasy": "🏙️",
        "Epic Fantasy": "⚔️",
        "Dark Fantasy": "🌑",
        "default": "🧙"
    },
    
    # AUTRES
    "HORROR": {"default": "👻"},
    "MYSTERY": {"default": "🔍"},
    "BACKGROUND": {"PLANNERS": "📋", "default": "📄"},
    "RELIGIONS": {"Christianisme": "✝️", "default": "🙏"}
}

def get_icon(main_cat, sub_cat):
    """Obtenir l'icône pour une catégorie"""
    main_cat_upper = main_cat.upper()
    if main_cat_upper in CATEGORY_ICONS:
        cat_icons = CATEGORY_ICONS[main_cat_upper]
        return cat_icons.get(sub_cat, cat_icons.get("default", "📁"))
    return "📁"

def slugify(text):
    """Convertir un texte en slug pour nom de fichier"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

def generate_html_page(main_cat, sub_cat, count, icon, first_image):
    """Génère le HTML pour une page de galerie - VERSION SANS BADGES"""
    
    slug = f"gallery-{slugify(main_cat)}-{slugify(sub_cat)}.html"
    category_path = sub_cat
    
    html = f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{main_cat} → {sub_cat} | GabaritKDP Marketplace</title>
  <meta name="description" content="{count} templates professionnels pour vos couvertures KDP">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0}}
    .header-nav{{background:linear-gradient(135deg,#1e293b,#334155);padding:15px 0;position:sticky;top:0;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,.1)}}
    .nav-container{{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-wrap:wrap;gap:10px}}
    .logo-nav{{display:flex;align-items:center;gap:15px;text-decoration:none;color:#fff}}
    .logo-nav img{{height:40px}}
    .logo-nav span{{font-size:1.3rem;font-weight:700;color:#FF9900}}
    .nav-links{{display:flex;gap:20px;flex-wrap:wrap}}
    .nav-links a{{color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:.95rem;transition:all .3s}}
    .nav-links a:hover{{color:#FF9900;background:rgba(255,153,0,.1)}}
    .nav-links a.active{{color:#FF9900;background:rgba(255,153,0,.15)}}
    .express-btn{{background:linear-gradient(135deg,#10b981,#059669)!important;color:#fff!important}}
    .hero-gradient{{background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#bae6fd 100%);padding:3rem 0}}
    .breadcrumb{{display:flex;align-items:center;gap:8px;font-size:.9rem;color:#64748b;margin-bottom:1.5rem;flex-wrap:wrap}}
    .breadcrumb a{{color:#FF9900;text-decoration:none;transition:.3s}}
    .breadcrumb a:hover{{text-decoration:underline}}
    .gallery-container{{max-width:1400px;margin:0 auto;padding:3rem 1rem}}
    .gallery-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;margin-top:2rem}}
    .template-card{{position:relative;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 15px rgba(0,0,0,.08);border:2px solid transparent;transition:all .3s;cursor:pointer}}
    .template-card:hover{{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.15);border-color:#FF9900}}
    .template-image{{width:100%;aspect-ratio:2/3;object-fit:cover;transition:.4s}}
    .template-card:hover .template-image{{transform:scale(1.05)}}
    .watermark{{position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 40px,rgba(0,0,0,0.02) 40px,rgba(0,0,0,0.02) 80px);pointer-events:none;z-index:1}}
    .watermark::after{{content:'GabaritKDP';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:2rem;font-weight:800;color:rgba(255,255,255,0.12);text-shadow:2px 2px 4px rgba(0,0,0,0.15);white-space:nowrap}}
    .template-overlay{{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.92),rgba(0,0,0,.4) 60%,transparent);opacity:0;transition:.3s;display:flex;flex-direction:column;justify-content:flex-end;padding:1.25rem;z-index:2}}
    .template-card:hover .template-overlay{{opacity:1}}
    .template-name{{font-size:.875rem;font-weight:600;color:#fff;margin-bottom:.5rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
    .template-size{{font-size:.75rem;color:#94a3b8;margin-bottom:.75rem}}
    .use-template-btn{{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;background:linear-gradient(135deg,#FF9900,#e68a00);color:#fff;font-weight:600;font-size:.875rem;border-radius:8px;border:none;cursor:pointer;transition:.3s}}
    .use-template-btn:hover{{background:linear-gradient(135deg,#e68a00,#cc7a00);transform:scale(1.02);box-shadow:0 4px 15px rgba(255,153,0,.5)}}
    .loading-container{{text-align:center;padding:4rem 2rem;color:#6b7280}}
    .loading-spinner{{display:inline-block;width:50px;height:50px;border:5px solid #e5e7eb;border-top-color:#FF9900;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1rem}}
    @keyframes spin{{to{{transform:rotate(360deg)}}}}
    .empty-state{{text-align:center;padding:4rem 2rem;background:#f9fafb;border-radius:16px;margin:2rem 0}}
    .empty-state-icon{{font-size:4rem;margin-bottom:1rem;opacity:.5}}
    .stats-container{{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin-top:1.5rem}}
    .stat-card{{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border-radius:12px;padding:1.25rem 2rem;text-align:center;box-shadow:0 4px 15px rgba(0,0,0,.05)}}
    .stat-number{{font-size:2rem;font-weight:800;color:#FF9900;margin-bottom:.25rem}}
    .stat-label{{font-size:.875rem;color:#64748b;font-weight:500}}
    .search-container{{max-width:500px;margin:0 auto 2rem}}
    .search-input{{width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:1rem;transition:.3s}}
    .search-input:focus{{outline:none;border-color:#FF9900;box-shadow:0 0 0 3px rgba(255,153,0,.1)}}
    @media(max-width:768px){{.nav-links{{display:none}}.stats-container{{gap:1rem}}.stat-card{{padding:1rem 1.5rem}}.gallery-grid{{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}}}}
  </style>
</head>
<body class="bg-gray-50">
  
  <header class="header-nav">
    <div class="nav-container">
      <a href="index.html" class="logo-nav">
        <img src="logo-gabarit-kdp-site-web.png" alt="GabaritKDP">
        <span>GabaritKDP</span>
      </a>
      <nav class="nav-links">
        <a href="index.html">🏠 Home</a>
        <a href="generator.html" class="express-btn">⚡ Generator</a>
        <a href="marketplace.html" class="active">Marketplace</a>
        <a href="pricing.html">💰 Pricing</a>
      </nav>
    </div>
  </header>

  <section class="hero-gradient">
    <div class="gallery-container">
      <nav class="breadcrumb">
        <a href="marketplace.html">Marketplace</a>
        <span>›</span>
        <a href="category-{slugify(main_cat)}.html">{main_cat}</a>
        <span>›</span>
        <span>{sub_cat}</span>
      </nav>
      
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span class="text-5xl mr-3">{icon}</span> {main_cat} → {sub_cat}
        </h1>
        <p class="text-lg text-gray-600 mb-4">Templates professionnels pour vos couvertures KDP</p>
        
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number" id="total-count">-</div>
            <div class="stat-label">Templates</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="gallery-container">
    <div class="search-container">
      <input type="text" id="search-input" class="search-input" placeholder="🔍 Rechercher un template..." disabled>
    </div>
    
    <div id="gallery-grid" class="gallery-grid">
      <div class="col-span-full loading-container">
        <div class="loading-spinner"></div>
        <p class="text-lg font-semibold">Chargement des templates...</p>
        <p class="text-sm text-gray-500 mt-2">Connexion au CDN...</p>
      </div>
    </div>
  </section>

  <footer class="bg-gray-900 text-gray-400 py-8 text-center mt-12">
    <p>&copy; 2025 GabaritKDP. All rights reserved.</p>
  </footer>

  <script>
    (function() {{
      'use strict';
      let galleryData = null;
      window.GalleryLoader = {{
        async load() {{
          if (galleryData) return galleryData;
          const url = `/gallery.json?v=${{Date.now()}}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${{response.status}}`);
          galleryData = await response.json();
          console.log('✅ JSON chargé -', galleryData.backgrounds?.length || 0, 'backgrounds');
          return galleryData;
        }},
        filter(category) {{
          if (!galleryData?.backgrounds) return [];
          const items = galleryData.backgrounds.filter(item => (item.url || item).includes(category));
          console.log(`✅ ${{items.length}} items pour "${{category}}"`);
          return items;
        }}
      }};
    }})();
  </script>
  
  <script>
    const PAGE_CONFIG = {{
      category: '{category_path}',
      icon: '{icon}'
    }};
    
    function createTemplateCard(item, index) {{
      const url = item.url || item;
      const filename = item.filename || url.split('/').pop();
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="watermark"></div>
        <img src="${{url}}" alt="{sub_cat} ${{index + 1}}" class="template-image" loading="lazy">
        <div class="template-overlay">
          <div class="template-name">${{filename}}</div>
          <div class="template-size">6x9" • High Quality</div>
          <button class="use-template-btn" onclick="window.open('${{url}}', '_blank')">
            <i class="fas fa-magic"></i> Use Template
          </button>
        </div>
      `;
      return card;
    }}
    
    function renderGallery(items) {{
      const container = document.getElementById('gallery-grid');
      if (!items?.length) {{
        container.innerHTML = '<div class="col-span-full empty-state"><div class="empty-state-icon">🖼️</div><h3 class="text-2xl font-bold text-gray-700">Aucun template</h3></div>';
        return;
      }}
      container.innerHTML = '';
      items.forEach((item, i) => container.appendChild(createTemplateCard(item, i)));
      document.getElementById('total-count').textContent = items.length;
      document.getElementById('search-input').disabled = false;
    }}
    
    document.addEventListener('DOMContentLoaded', async () => {{
      try {{
        await GalleryLoader.load();
        const items = GalleryLoader.filter(PAGE_CONFIG.category);
        renderGallery(items);
      }} catch (error) {{
        document.getElementById('gallery-grid').innerHTML = '<div class="col-span-full empty-state" style="background:#fee2e2"><div class="empty-state-icon" style="color:#dc2626">⚠️</div><h3 style="color:#dc2626">Erreur de chargement</h3><button onclick="location.reload()" class="px-6 py-3 bg-red-600 text-white rounded-lg mt-4">Recharger</button></div>';
      }}
    }});
  </script>
</body>
</html>'''
    
    return slug, html

def analyze_gallery_json(json_file_path):
    """Analyser le gallery.json et extraire toutes les catégories"""
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    categories = defaultdict(lambda: {"count": 0, "first_image": None})
    
    for item in data['backgrounds']:
        folder = item.get('folder', '')
        parts = folder.split('/')
        
        if len(parts) >= 2:
            main_cat = parts[0]
            sub_cat = parts[1]
            cat_key = f"{main_cat}/{sub_cat}"
            
            categories[cat_key]["count"] += 1
            if categories[cat_key]["first_image"] is None:
                categories[cat_key]["first_image"] = item.get('url', '')
    
    return categories

def main():
    print("🚀 GÉNÉRATEUR AUTOMATIQUE DE PAGES MARKETPLACE")
    print("=" * 60)
    
    # Vérifier si gallery.json existe
    json_path = Path("gallery.json")
    if not json_path.exists():
        print("❌ Erreur: gallery.json introuvable")
        print("💡 Téléchargez-le depuis: https://gabaritkdp.com/gallery.json")
        return
    
    # Analyser les catégories
    print("📊 Analyse du gallery.json...")
    categories = analyze_gallery_json(json_path)
    print(f"✅ {len(categories)} catégories trouvées")
    
    # Créer le dossier de sortie
    output_dir = Path("generated_pages")
    output_dir.mkdir(exist_ok=True)
    
    # Générer les pages
    print("\n📝 Génération des pages HTML...")
    generated_files = []
    
    for cat_key, info in sorted(categories.items()):
        main_cat, sub_cat = cat_key.split('/')
        icon = get_icon(main_cat, sub_cat)
        
        slug, html = generate_html_page(
            main_cat, 
            sub_cat, 
            info["count"], 
            icon, 
            info["first_image"]
        )
        
        filepath = output_dir / slug
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        
        generated_files.append((slug, main_cat, sub_cat, info["count"]))
        print(f"  ✅ {slug} ({info['count']} templates)")
    
    # Créer le README
    readme_path = output_dir / "README.txt"
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(f"🎉 PAGES DE GALERIE GÉNÉRÉES\n")
        f.write(f"{'=' * 60}\n\n")
        f.write(f"Total: {len(generated_files)} pages\n\n")
        f.write(f"LISTE DES FICHIERS:\n")
        f.write(f"{'-' * 60}\n")
        for slug, main_cat, sub_cat, count in generated_files:
            f.write(f"{slug}\n  → {main_cat} / {sub_cat} ({count} templates)\n\n")
        f.write(f"\n{'=' * 60}\n")
        f.write(f"INSTRUCTIONS:\n")
        f.write(f"1. Uploadez tous ces fichiers .html sur Netlify\n")
        f.write(f"2. Ils seront accessibles à: https://gabaritkdp.com/[nom-fichier].html\n")
        f.write(f"3. Aucun badge PRO/FREE (marketplace réservée aux abonnés)\n")
    
    print("\n" + "=" * 60)
    print(f"🎉 {len(generated_files)} pages générées avec succès!")
    print(f"📁 Emplacement: {output_dir.absolute()}")
    print(f"📝 README.txt créé avec la liste complète")
    print("\n✅ Prêt pour upload sur Netlify!")

if __name__ == "__main__":
    main()
