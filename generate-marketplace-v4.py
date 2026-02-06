#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================
GabaritKDP Marketplace Generator v3.0 - HYBRID NAVIGATION
=============================================================
Navigation hybride automatique :
- Mode A (3 niveaux) : si sous-catégorie a ≥4 sous-sous-cat OU ≥120 images
- Mode B (2 niveaux) : sinon

URLs générées :
- category-{cat}.html
- subcategory-{cat}-{sub}.html
- gallery-{cat}-{sub}-{subsub}.html (Mode A uniquement)

USAGE: python generate-marketplace-v3.py
=============================================================
"""

import json
import re
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Tuple
from urllib.parse import quote

# =============================================================
# CONFIGURATION
# =============================================================

EXCEL_FILE = r"inventaire_marketplace.xlsx"
OUTPUT_DIR = r"./output"
R2_BASE_URL = "https://pub-7e9ed5303066447d83c33d68f896441b.r2.dev/"
FREE_PERCENTAGE = 0.20
ITEMS_PER_PAGE = 24

def get_r2_prefix(category: str) -> str:
    """Retourne le préfixe R2 selon la catégorie."""
    if category.upper() == "FULL COVER":
        return "fullcovers/"
    else:
        return "backgrounds/"

def build_r2_url(category: str, relative_path: str) -> str:
    """Construit l'URL R2 complète à partir du chemin relatif."""
    if not relative_path:
        return ""
    
    # Convertir les backslashes en forward slashes
    path = relative_path.replace("\\", "/")
    
    # Pour FULL COVER, enlever "FULL COVER/" du début du chemin
    if category.upper() == "FULL COVER" and path.upper().startswith("FULL COVER/"):
        path = path[11:]  # len("FULL COVER/") = 11
    
    # Encoder chaque segment du chemin
    segments = path.split("/")
    encoded_segments = [quote(seg, safe='') for seg in segments]
    encoded_path = "/".join(encoded_segments)
    
    return f"{R2_BASE_URL}{get_r2_prefix(category)}{encoded_path}"

# Seuils pour Mode A (3 niveaux)
MIN_SUBSUB_COUNT = 4      # Minimum de sous-sous-catégories
MIN_IMAGES_COUNT = 120    # OU minimum d'images dans la sous-catégorie

CATEGORY_ICONS = {
    "ANIMAUX": "🐾", "BOHEME": "🌸", "BUSINESS": "💼", "CARTOON": "🎬",
    "COLORIAGES": "🖍️", "FANTASY": "🐉", "FULL COVER": "📚", "HIPPIE": "☮️",
    "HISTORICAL": "🏰", "MYSTERY": "🔍", "PLANNERS": "📅", "RELIGIONS": "✝️",
    "ROMANCE": "💕", "SCI-FI": "🚀", "THRILLER": "🔪",
}

CATEGORY_GRADIENTS = {
    "ROMANCE": "linear-gradient(135deg,#fdf2f8 0%,#fce7f3 50%,#fbcfe8 100%)",
    "THRILLER": "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 50%,#cbd5e1 100%)",
    "FANTASY": "linear-gradient(135deg,#faf5ff 0%,#f3e8ff 50%,#e9d5ff 100%)",
    "PLANNERS": "linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#bfdbfe 100%)",
    "FULL COVER": "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)",
    "COLORIAGES": "linear-gradient(135deg,#fefce8 0%,#fef9c3 50%,#fef08a 100%)",
    "DEFAULT": "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",
}

# =============================================================
# UTILITAIRES
# =============================================================

def slugify(text: str) -> str:
    if pd.isna(text):
        return ""
    text = str(text)
    replacements = {
        'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a',
        'è':'e','é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i',
        'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ù':'u','ú':'u','û':'u','ü':'u',
        'ç':'c','ñ':'n','À':'a','Á':'a','Â':'a','Ã':'a','Ä':'a','Å':'a',
        'È':'e','É':'e','Ê':'e','Ë':'e','Ì':'i','Í':'i','Î':'i','Ï':'i',
        'Ò':'o','Ó':'o','Ô':'o','Õ':'o','Ö':'o','Ù':'u','Ú':'u','Û':'u','Ü':'u',
        'Ç':'c','Ñ':'n',
    }
    text_clean = text.lower()
    for accent, repl in replacements.items():
        text_clean = text_clean.replace(accent, repl)
    text_clean = re.sub(r'[^\w\s-]', '', text_clean)
    text_clean = re.sub(r'[-\s]+', '-', text_clean)
    return text_clean.strip('-')

def get_icon(cat): return CATEGORY_ICONS.get(cat.upper(), "📁")
def get_gradient(cat): return CATEGORY_GRADIENTS.get(cat.upper(), CATEGORY_GRADIENTS["DEFAULT"])

# =============================================================
# CHARGEMENT DONNÉES EXCEL
# =============================================================

def load_data(excel_file: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Charge les données depuis l'Excel."""
    xl = pd.ExcelFile(excel_file)
    files_df = pd.read_excel(xl, sheet_name='Files')
    hierarchy_df = pd.read_excel(xl, sheet_name='Hierarchy')
    return files_df, hierarchy_df

def build_structure(files_df: pd.DataFrame, hierarchy_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Construit la structure de données avec détection automatique Mode A/B.
    """
    structure = {}
    
    # Grouper par catégorie
    categories = files_df['Category'].unique()
    
    for cat in sorted(categories):
        cat_files = files_df[files_df['Category'] == cat]
        cat_slug = slugify(cat)
        
        # Construire les sous-catégories
        subcategories = {}
        
        # Récupérer les sous-catégories uniques
        subcats = cat_files['Subcategory'].dropna().unique()
        
        if len(subcats) == 0:
            # Pas de sous-catégorie = images directement dans la catégorie
            # On crée une sous-catégorie virtuelle "All"
            files_list = []
            for _, row in cat_files.iterrows():
                files_list.append({
                    "name": Path(row['File Name']).stem,
                    "file": row['File Name'],
                    "fileSlug": slugify(Path(row['File Name']).stem) + Path(row['File Name']).suffix.lower(),
                    "size": int(row['Size (KB)'] * 1024),
                    "path": row['Relative Path'],
                })
            
            # Marquer les gratuits
            free_count = max(1, int(len(files_list) * FREE_PERCENTAGE))
            for i, f in enumerate(files_list):
                f["isFree"] = i < free_count
            
            subcategories["All"] = {
                "name": cat,
                "slug": "all",
                "total": len(files_list),
                "free": free_count,
                "mode": "B",
                "subsubcategories": {},
                "files": files_list,
                "previewImage": files_list[0]["file"] if files_list else None,
                "previewPath": files_list[0]["path"] if files_list else None,
            }
        else:
            for subcat in sorted(subcats):
                subcat_files = cat_files[cat_files['Subcategory'] == subcat]
                subcat_slug = slugify(subcat)
                
                # Récupérer les sous-sous-catégories
                subsubcats = subcat_files['SubSubcategory'].dropna().unique()
                
                # Calculer le total d'images dans cette sous-catégorie
                total_images = len(subcat_files)
                
                # Déterminer le mode A ou B
                has_subsubcats = len(subsubcats) >= MIN_SUBSUB_COUNT
                has_many_images = total_images >= MIN_IMAGES_COUNT
                mode = "A" if (has_subsubcats or has_many_images) and len(subsubcats) > 0 else "B"
                
                subsubcategories = {}
                direct_files = []
                
                if mode == "A" and len(subsubcats) > 0:
                    # Mode A : on garde les sous-sous-catégories
                    for subsub in sorted(subsubcats):
                        subsub_files = subcat_files[subcat_files['SubSubcategory'] == subsub]
                        subsub_slug = slugify(subsub)
                        
                        files_list = []
                        for _, row in subsub_files.iterrows():
                            files_list.append({
                                "name": Path(row['File Name']).stem,
                                "file": row['File Name'],
                                "fileSlug": slugify(Path(row['File Name']).stem) + Path(row['File Name']).suffix.lower(),
                                "size": int(row['Size (KB)'] * 1024),
                                "path": row['Relative Path'],
                            })
                        
                        free_count = max(1, int(len(files_list) * FREE_PERCENTAGE))
                        for i, f in enumerate(files_list):
                            f["isFree"] = i < free_count
                        
                        subsubcategories[subsub] = {
                            "name": subsub,
                            "slug": subsub_slug,
                            "total": len(files_list),
                            "free": free_count,
                            "files": files_list,
                            "previewImage": files_list[0]["file"] if files_list else None,
                            "previewPath": files_list[0]["path"] if files_list else None,
                        }
                    
                    # Fichiers sans sous-sous-catégorie
                    no_subsub = subcat_files[subcat_files['SubSubcategory'].isna()]
                    for _, row in no_subsub.iterrows():
                        direct_files.append({
                            "name": Path(row['File Name']).stem,
                            "file": row['File Name'],
                            "fileSlug": slugify(Path(row['File Name']).stem) + Path(row['File Name']).suffix.lower(),
                            "size": int(row['Size (KB)'] * 1024),
                            "path": row['Relative Path'],
                        })
                else:
                    # Mode B : on aplatit tout
                    for _, row in subcat_files.iterrows():
                        direct_files.append({
                            "name": Path(row['File Name']).stem,
                            "file": row['File Name'],
                            "fileSlug": slugify(Path(row['File Name']).stem) + Path(row['File Name']).suffix.lower(),
                            "size": int(row['Size (KB)'] * 1024),
                            "path": row['Relative Path'],
                        })
                
                # Marquer les gratuits dans direct_files
                free_count_direct = max(1, int(len(direct_files) * FREE_PERCENTAGE)) if direct_files else 0
                for i, f in enumerate(direct_files):
                    f["isFree"] = i < free_count_direct
                
                # Total free
                total_free = free_count_direct + sum(ss["free"] for ss in subsubcategories.values())
                
                # Preview image
                preview = None
                preview_path = None
                if subsubcategories:
                    first_subsub = list(subsubcategories.values())[0]
                    preview = first_subsub["previewImage"]
                    preview_path = first_subsub["previewPath"]
                elif direct_files:
                    preview = direct_files[0]["file"]
                    preview_path = direct_files[0]["path"]
                
                subcategories[subcat] = {
                    "name": subcat,
                    "slug": subcat_slug,
                    "total": total_images,
                    "free": total_free,
                    "mode": mode,
                    "subsubcategories": subsubcategories,
                    "files": direct_files,
                    "previewImage": preview,
                    "previewPath": preview_path,
                }
        
        # Calculer totaux catégorie
        cat_total = sum(s["total"] for s in subcategories.values())
        cat_free = sum(s["free"] for s in subcategories.values())
        
        structure[cat] = {
            "name": cat,
            "slug": cat_slug,
            "total": cat_total,
            "free": cat_free,
            "icon": get_icon(cat),
            "gradient": get_gradient(cat),
            "subcategories": subcategories,
        }
    
    return structure

# =============================================================
# HTML TEMPLATES
# =============================================================

def html_head(title: str, desc: str, gradient: str) -> str:
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link href="style.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}}
    .header-nav{{background:linear-gradient(135deg,#1e293b,#334155);padding:15px 0;position:sticky;top:0;z-index:999}}
    .nav-container{{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 20px;flex-wrap:wrap;gap:10px}}
    .logo-nav{{display:flex;align-items:center;gap:15px;text-decoration:none;color:#fff}}
    .logo-nav img{{height:40px}}
    .logo-nav span{{font-size:1.3rem;font-weight:700;color:#FF9900}}
    .nav-links{{display:flex;gap:20px;flex-wrap:wrap}}
    .nav-links a{{color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-size:.95rem}}
    .nav-links a:hover{{color:#FF9900;background:rgba(255,153,0,.1)}}
    .nav-links a.active{{color:#FF9900;background:rgba(255,153,0,.15)}}
    .express-btn{{background:linear-gradient(135deg,#10b981,#059669)!important}}
    .hero-gradient{{background:{gradient}}}
    .breadcrumb{{display:flex;align-items:center;gap:8px;font-size:.9rem;color:#64748b;margin-bottom:1rem;flex-wrap:wrap}}
    .breadcrumb a{{color:#FF9900;text-decoration:none}}
    .breadcrumb a:hover{{text-decoration:underline}}
    .category-card{{position:relative;border-radius:16px;overflow:hidden;aspect-ratio:4/3;cursor:pointer;transition:.3s;box-shadow:0 4px 15px rgba(0,0,0,.1);background:#f1f5f9}}
    .category-card:hover{{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.15)}}
    .category-card img{{width:100%;height:100%;object-fit:cover;transition:.5s}}
    .category-card:hover img{{transform:scale(1.1)}}
    .category-overlay{{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,.3) 50%,transparent);display:flex;flex-direction:column;justify-content:flex-end;padding:1.5rem}}
    .category-icon{{font-size:2rem;margin-bottom:.5rem}}
    .category-name{{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:.25rem}}
    .category-count{{color:#FF9900;font-weight:600;font-size:.875rem}}
    .category-badge{{position:absolute;top:1rem;right:1rem;padding:.25rem .75rem;border-radius:9999px;font-size:.75rem;font-weight:600;color:#fff}}
    .badge-new{{background:#10b981}}.badge-popular{{background:#f59e0b}}.badge-best{{background:#8b5cf6}}
    
    /* Template Gallery Styles */
    .template-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}}
    .template-card{{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:4/3;cursor:pointer;transition:.3s;box-shadow:0 4px 15px rgba(0,0,0,.08);background:#f8fafc;border:1px solid #e2e8f0}}
    .template-card:hover{{transform:translateY(-6px);box-shadow:0 15px 35px rgba(0,0,0,.12);border-color:#FF9900}}
    .template-card img{{width:100%;height:100%;object-fit:cover;transition:.4s}}
    .template-card:hover img{{transform:scale(1.05)}}
    
    /* Watermark Overlay */
    .watermark{{position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0px,rgba(255,255,255,0.06) 40px,rgba(0,0,0,0.04) 40px,rgba(0,0,0,0.04) 80px);pointer-events:none;z-index:1}}
    .watermark::after{{content:'GabaritKDP';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:2.5rem;font-weight:800;color:rgba(255,255,255,0.15);text-shadow:2px 2px 4px rgba(0,0,0,0.2);pointer-events:none;white-space:nowrap}}
    
    /* Template Overlay with buttons */
    .template-overlay{{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9),rgba(0,0,0,.3) 60%,transparent);opacity:0;transition:.3s;display:flex;flex-direction:column;justify-content:flex-end;padding:1rem;z-index:2}}
    .template-card:hover .template-overlay{{opacity:1}}
    .template-name{{font-size:.875rem;font-weight:600;color:#fff;margin-bottom:.25rem}}
    .template-size{{font-size:.75rem;color:#94a3b8;margin-bottom:.75rem}}
    
    /* Use Template Button */
    .use-template-btn{{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px 16px;background:linear-gradient(135deg,#FF9900,#e68a00);color:#fff;font-weight:600;font-size:.875rem;border-radius:8px;text-decoration:none;transition:.3s;border:none;cursor:pointer}}
    .use-template-btn:hover{{background:linear-gradient(135deg,#e68a00,#cc7a00);transform:scale(1.02);box-shadow:0 4px 15px rgba(255,153,0,.4)}}
    .use-template-btn i{{font-size:.75rem}}
    
    /* Free Badge */
    .free-badge{{position:absolute;top:.75rem;left:.75rem;background:#10b981;color:#fff;padding:.25rem .5rem;border-radius:6px;font-size:.7rem;font-weight:700;z-index:3}}
    .premium-badge{{position:absolute;top:.75rem;right:.75rem;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;padding:.25rem .5rem;border-radius:6px;font-size:.65rem;font-weight:600;z-index:3}}
    
    /* Lightbox */
    .lightbox{{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:none;align-items:center;justify-content:center;flex-direction:column}}
    .lightbox.active{{display:flex}}
    .lightbox img{{max-width:90vw;max-height:70vh;object-fit:contain;border-radius:8px}}
    .lightbox-watermark{{position:absolute;font-size:4rem;font-weight:800;color:rgba(255,255,255,0.1);transform:rotate(-30deg);pointer-events:none}}
    .lightbox-close{{position:absolute;top:20px;right:20px;background:rgba(255,255,255,.1);border:none;color:#fff;width:50px;height:50px;border-radius:50%;cursor:pointer;font-size:1.5rem;transition:.3s}}
    .lightbox-close:hover{{background:rgba(255,255,255,.2)}}
    .lightbox-nav{{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;width:50px;height:50px;border-radius:50%;cursor:pointer;font-size:1.2rem;transition:.3s}}
    .lightbox-nav:hover{{background:rgba(255,255,255,.2)}}
    .lightbox-prev{{left:20px}}
    .lightbox-next{{right:20px}}
    .lightbox-info{{position:absolute;bottom:20px;text-align:center;color:#fff}}
    .lightbox-title{{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}}
    .lightbox-counter{{font-size:.875rem;color:#94a3b8;margin-bottom:1rem}}
    .lightbox-use-btn{{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:linear-gradient(135deg,#FF9900,#e68a00);color:#fff;font-weight:600;border-radius:8px;text-decoration:none;transition:.3s}}
    .lightbox-use-btn:hover{{background:linear-gradient(135deg,#e68a00,#cc7a00);transform:scale(1.05)}}
    
    /* Search & Filter */
    .search-bar{{display:flex;gap:12px;margin-bottom:2rem;flex-wrap:wrap;align-items:center;justify-content:center}}
    .search-input{{flex:1;min-width:200px;max-width:400px;padding:12px 16px;border:2px solid #e2e8f0;border-radius:10px;font-size:1rem;transition:.3s}}
    .search-input:focus{{outline:none;border-color:#FF9900;box-shadow:0 0 0 3px rgba(255,153,0,.1)}}
    .filter-btn{{padding:10px 20px;border:2px solid #e2e8f0;background:#fff;border-radius:10px;cursor:pointer;font-weight:500;transition:.3s}}
    .filter-btn:hover{{border-color:#FF9900;color:#FF9900}}
    .filter-btn.active{{background:#FF9900;color:#fff;border-color:#FF9900}}
    .pagination{{display:flex;justify-content:center;gap:8px;margin-top:2rem}}
    .page-btn{{padding:10px 16px;border:2px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer;font-weight:500;transition:.3s}}
    .page-btn:hover:not(:disabled){{border-color:#FF9900;color:#FF9900}}
    .page-btn.active{{background:#FF9900;color:#fff;border-color:#FF9900}}
    .page-btn:disabled{{opacity:.5;cursor:not-allowed}}
    @media(max-width:768px){{.nav-links{{display:none}}}}
  </style>
</head>
<body class="bg-white">
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
'''

def html_footer():
    return '''
  <footer class="bg-gray-900 text-gray-400 py-8 text-center">
    <p>&copy; 2025 GabaritKDP. All rights reserved.</p>
  </footer>
</body>
</html>
'''

# =============================================================
# PAGE CATÉGORIE
# =============================================================

def gen_category_page(cat_data: Dict) -> str:
    name, slug, icon = cat_data["name"], cat_data["slug"], cat_data["icon"]
    gradient, total, free = cat_data["gradient"], cat_data["total"], cat_data["free"]
    subcats = cat_data["subcategories"]
    
    cards = ""
    for sub_name, sub_data in subcats.items():
        if sub_data["slug"] == "all" and sub_data["name"] == cat_data["name"]:
            # Catégorie sans sous-catégorie → lien direct vers galerie
            page_link = f"subcategory-{slug}-all.html"
        else:
            page_link = f"subcategory-{slug}-{sub_data['slug']}.html"
        
        preview_url = build_r2_url(name, sub_data.get('previewPath', '')) if sub_data.get('previewPath') else ""
        
        badge = ""
        if sub_data["total"] > 500: badge = '<span class="category-badge badge-best">BEST SELLER</span>'
        elif sub_data["total"] > 100: badge = '<span class="category-badge badge-popular">POPULAR</span>'
        elif sub_data["total"] > 50: badge = '<span class="category-badge badge-new">NEW</span>'
        
        mode_badge = f'<span class="category-badge" style="background:#6366f1;top:auto;bottom:1rem">{sub_data["mode"]}</span>' if sub_data.get("mode") == "A" else ""
        
        cards += f'''
        <div class="category-card" onclick="location.href='{page_link}'">
          <img src="{preview_url}" alt="{sub_name}" loading="lazy">
          <div class="category-overlay">
            <span class="category-icon">{icon}</span>
            <span class="category-name">{sub_name}</span>
            <span class="category-count">{sub_data['total']} templates • {sub_data['free']} free</span>
          </div>
          {badge}
        </div>'''
    
    html = html_head(f"{name} - GabaritKDP", f"{total}+ {name} templates", gradient)
    html += f'''
  <section class="hero-gradient py-12">
    <div class="max-w-7xl mx-auto px-4">
      <nav class="breadcrumb"><a href="marketplace.html">Marketplace</a> <span>›</span> <span>{name}</span></nav>
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span class="text-5xl mr-3">{icon}</span> {name} <span style="color:#FF9900">Templates</span>
        </h1>
        <div class="flex justify-center gap-8 mt-6">
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{total}</div>
            <div class="text-sm text-gray-600">Templates</div>
          </div>
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{len(subcats)}</div>
            <div class="text-sm text-gray-600">Subcategories</div>
          </div>
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{free}</div>
            <div class="text-sm text-gray-600">Free</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-10">Choose Your Style</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{cards}</div>
    </div>
  </section>
  <section class="py-12 bg-gray-50 text-center">
    <a href="marketplace.html" class="inline-block px-6 py-3 text-white font-semibold rounded-lg" style="background:#FF9900">← Back to Marketplace</a>
    <a href="generator.html" class="inline-block px-6 py-3 ml-4 text-white font-semibold rounded-lg" style="background:linear-gradient(135deg,#10b981,#059669)">⚡ Create My Cover</a>
  </section>
'''
    html += html_footer()
    return html

# =============================================================
# PAGE SOUS-CATÉGORIE (Mode A = liste sous-sous / Mode B = galerie)
# =============================================================

def gen_subcategory_page(cat_data: Dict, sub_data: Dict) -> str:
    cat_name, cat_slug, cat_icon = cat_data["name"], cat_data["slug"], cat_data["icon"]
    gradient = cat_data["gradient"]
    sub_name, sub_slug = sub_data["name"], sub_data["slug"]
    total, free = sub_data["total"], sub_data["free"]
    mode = sub_data.get("mode", "B")
    subsubcats = sub_data.get("subsubcategories", {})
    files = sub_data.get("files", [])
    
    if mode == "A" and subsubcats:
        # Mode A : Afficher la liste des sous-sous-catégories (comme une page catégorie)
        cards = ""
        for subsub_name, subsub_data in subsubcats.items():
            page_link = f"gallery-{cat_slug}-{sub_slug}-{subsub_data['slug']}.html"
            preview_url = build_r2_url(cat_name, subsub_data.get('previewPath', '')) if subsub_data.get('previewPath') else ""
            
            badge = ""
            if subsub_data["total"] > 100: badge = '<span class="category-badge badge-popular">POPULAR</span>'
            elif subsub_data["total"] > 50: badge = '<span class="category-badge badge-new">NEW</span>'
            
            cards += f'''
            <div class="category-card" onclick="location.href='{page_link}'">
              <img src="{preview_url}" alt="{subsub_name}" loading="lazy">
              <div class="category-overlay">
                <span class="category-icon">{cat_icon}</span>
                <span class="category-name">{subsub_name}</span>
                <span class="category-count">{subsub_data['total']} templates • {subsub_data['free']} free</span>
              </div>
              {badge}
            </div>'''
        
        html = html_head(f"{cat_name} → {sub_name}", f"{total} templates", gradient)
        html += f'''
  <section class="hero-gradient py-12">
    <div class="max-w-7xl mx-auto px-4">
      <nav class="breadcrumb">
        <a href="marketplace.html">Marketplace</a> <span>›</span>
        <a href="category-{cat_slug}.html">{cat_name}</a> <span>›</span>
        <span>{sub_name}</span>
      </nav>
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span class="text-5xl mr-3">{cat_icon}</span> {sub_name}
        </h1>
        <p class="text-xl text-gray-600 mb-4">{total} templates in {len(subsubcats)} collections</p>
        <div class="flex justify-center gap-8">
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{total}</div>
            <div class="text-sm text-gray-600">Templates</div>
          </div>
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{len(subsubcats)}</div>
            <div class="text-sm text-gray-600">Collections</div>
          </div>
          <div class="bg-white/60 rounded-xl px-6 py-3 text-center">
            <div class="text-3xl font-bold" style="color:#FF9900">{free}</div>
            <div class="text-sm text-gray-600">Free</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-10">Browse Collections</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{cards}</div>
    </div>
  </section>
  <section class="py-8 bg-gray-50 text-center">
    <a href="category-{cat_slug}.html" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-arrow-left"></i> Back to {cat_name}</a>
    <a href="marketplace.html" class="inline-flex items-center gap-2 px-5 py-2.5 ml-2 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-th-large"></i> All Categories</a>
  </section>
'''
        html += html_footer()
        return html
    
    else:
        # Mode B : Galerie directe avec pagination
        return gen_gallery_page(cat_data, sub_data, None, files)

# =============================================================
# PAGE GALERIE (images avec pagination, filtres, lightbox)
# =============================================================

def gen_gallery_page(cat_data: Dict, sub_data: Dict, subsub_data: Dict = None, files: List = None) -> str:
    cat_name, cat_slug, cat_icon = cat_data["name"], cat_data["slug"], cat_data["icon"]
    gradient = cat_data["gradient"]
    sub_name, sub_slug = sub_data["name"], sub_data["slug"]
    
    if subsub_data:
        # Mode A : gallery-{cat}-{sub}-{subsub}.html
        page_name = subsub_data["name"]
        page_slug = subsub_data["slug"]
        total = subsub_data["total"]
        free = subsub_data["free"]
        files = subsub_data["files"]
        breadcrumb = f'''
        <a href="marketplace.html">Marketplace</a> <span>›</span>
        <a href="category-{cat_slug}.html">{cat_name}</a> <span>›</span>
        <a href="subcategory-{cat_slug}-{sub_slug}.html">{sub_name}</a> <span>›</span>
        <span>{page_name}</span>'''
        back_link = f'subcategory-{cat_slug}-{sub_slug}.html'
        back_name = sub_name
        title = f"{cat_name} → {sub_name} → {page_name}"
    else:
        # Mode B : subcategory-{cat}-{sub}.html avec galerie directe
        page_name = sub_name
        page_slug = sub_slug
        total = sub_data["total"]
        free = sub_data["free"]
        files = files or sub_data.get("files", [])
        breadcrumb = f'''
        <a href="marketplace.html">Marketplace</a> <span>›</span>
        <a href="category-{cat_slug}.html">{cat_name}</a> <span>›</span>
        <span>{sub_name}</span>'''
        back_link = f'category-{cat_slug}.html'
        back_name = cat_name
        title = f"{cat_name} → {sub_name}"
    
    # Construire les URLs R2 complètes pour chaque fichier
    files_json = json.dumps([
        {
            "name": f["name"], 
            "url": build_r2_url(cat_name, f["path"]),
            "size": f["size"], 
            "isFree": f["isFree"]
        }
        for f in files
    ], ensure_ascii=False)
    
    html = html_head(title, f"{total} templates", gradient)
    html += f'''
  <section class="hero-gradient py-10">
    <div class="max-w-7xl mx-auto px-4">
      <nav class="breadcrumb">{breadcrumb}</nav>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <span class="text-4xl mr-2">{cat_icon}</span> {title.replace(" → ", " → <span style='color:#FF9900'>", 1)}</span>
          </h1>
          <p class="text-gray-600">{total} professional templates</p>
        </div>
        <div class="flex gap-3">
          <div class="bg-white/80 rounded-xl px-5 py-2 border text-center">
            <div class="text-2xl font-bold" style="color:#FF9900">{total}</div>
            <div class="text-xs text-gray-600">Templates</div>
          </div>
          <div class="bg-white/80 rounded-xl px-5 py-2 border border-green-200 text-center">
            <div class="text-2xl font-bold text-green-600">{free}</div>
            <div class="text-xs text-gray-600">Free</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="py-10 bg-white">
    <div class="max-w-7xl mx-auto px-4">
      <div class="search-bar">
        <input type="text" class="search-input" id="searchInput" placeholder="Search templates..." oninput="filterTemplates()">
        <button class="filter-btn active" onclick="filterByType('all',this)">All</button>
        <button class="filter-btn" onclick="filterByType('free',this)">Free</button>
        <button class="filter-btn" onclick="filterByType('premium',this)">Premium</button>
      </div>
      <div class="template-grid" id="grid"></div>
      <div class="pagination" id="pagination"></div>
    </div>
  </section>
  <div class="lightbox" id="lightbox" onclick="closeLB(event)">
    <button class="lightbox-close" onclick="closeLB()"><i class="fas fa-times"></i></button>
    <button class="lightbox-nav lightbox-prev" onclick="event.stopPropagation();navLB(-1)"><i class="fas fa-chevron-left"></i></button>
    <div style="position:relative">
      <img id="lbImg" onclick="event.stopPropagation()">
      <div class="lightbox-watermark">GabaritKDP</div>
    </div>
    <button class="lightbox-nav lightbox-next" onclick="event.stopPropagation();navLB(1)"><i class="fas fa-chevron-right"></i></button>
    <div class="lightbox-info">
      <div id="lbTitle" class="lightbox-title"></div>
      <div id="lbCounter" class="lightbox-counter"></div>
      <a id="lbUseBtn" class="lightbox-use-btn" href="#"><i class="fas fa-magic"></i> Use this template</a>
    </div>
  </div>
  <section class="py-8 bg-gray-50 text-center">
    <a href="{back_link}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-arrow-left"></i> Back to {back_name}</a>
    <a href="marketplace.html" class="inline-flex items-center gap-2 px-5 py-2.5 ml-2 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-th-large"></i> All Categories</a>
    <a href="generator.html" class="inline-flex items-center gap-2 px-5 py-2.5 ml-2 text-white font-semibold rounded-lg" style="background:linear-gradient(135deg,#10b981,#059669)"><i class="fas fa-magic"></i> Create</a>
  </section>
  <script>
    const templates={files_json};
    const PER_PAGE={ITEMS_PER_PAGE};
    let page=1,filtered=[...templates],filter='all',lbIdx=0;
    function formatSize(b){{return (b/1024/1024).toFixed(2)+' MB'}}
    function getGeneratorUrl(imageUrl){{return 'generator.html?image='+encodeURIComponent(imageUrl)}}
    function render(){{
      const start=(page-1)*PER_PAGE,end=start+PER_PAGE;
      const items=filtered.slice(start,end);
      document.getElementById('grid').innerHTML=items.map((t,i)=>`
        <div class="template-card">
          ${{t.isFree?'<span class="free-badge">FREE</span>':'<span class="premium-badge">PRO</span>'}}
          <img src="${{t.url}}" alt="${{t.name}}" loading="lazy" onclick="openLB(${{start+i}})">
          <div class="watermark"></div>
          <div class="template-overlay">
            <span class="template-name">${{t.name}}</span>
            <span class="template-size">${{formatSize(t.size)}}</span>
            <a href="${{getGeneratorUrl(t.url)}}" class="use-template-btn" onclick="event.stopPropagation()">
              <i class="fas fa-magic"></i> Use this template
            </a>
          </div>
        </div>
      `).join('');
      renderPagination();
    }}
    function renderPagination(){{
      const total=Math.ceil(filtered.length/PER_PAGE);
      if(total<=1){{document.getElementById('pagination').innerHTML='';return}}
      let h=`<button class="page-btn" onclick="goTo(${{page-1}})" ${{page===1?'disabled':''}}><i class="fas fa-chevron-left"></i></button>`;
      for(let i=Math.max(1,page-2);i<=Math.min(total,page+2);i++)h+=`<button class="page-btn ${{i===page?'active':''}}" onclick="goTo(${{i}})">${{i}}</button>`;
      h+=`<button class="page-btn" onclick="goTo(${{page+1}})" ${{page===total?'disabled':''}}><i class="fas fa-chevron-right"></i></button>`;
      document.getElementById('pagination').innerHTML=h;
    }}
    function goTo(p){{const t=Math.ceil(filtered.length/PER_PAGE);if(p<1||p>t)return;page=p;render();window.scrollTo({{top:document.getElementById('grid').offsetTop-100,behavior:'smooth'}})}}
    function filterTemplates(){{
      const q=document.getElementById('searchInput').value.toLowerCase();
      filtered=templates.filter(t=>{{
        const mq=t.name.toLowerCase().includes(q);
        const mf=filter==='all'||(filter==='free'&&t.isFree)||(filter==='premium'&&!t.isFree);
        return mq&&mf;
      }});
      page=1;render();
    }}
    function filterByType(type,btn){{document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');filter=type;filterTemplates()}}
    function openLB(i){{
      lbIdx=i;
      const t=filtered[i];
      document.getElementById('lbImg').src=t.url;
      document.getElementById('lbTitle').textContent=t.name;
      document.getElementById('lbCounter').textContent=`${{i+1}} / ${{filtered.length}} ${{t.isFree?'• FREE':'• PRO'}}`;
      document.getElementById('lbUseBtn').href=getGeneratorUrl(t.url);
      document.getElementById('lightbox').classList.add('active');
      document.body.style.overflow='hidden';
    }}
    function closeLB(e){{if(e&&e.target!==e.currentTarget)return;document.getElementById('lightbox').classList.remove('active');document.body.style.overflow=''}}
    function navLB(d){{
      lbIdx=(lbIdx+d+filtered.length)%filtered.length;
      const t=filtered[lbIdx];
      document.getElementById('lbImg').src=t.url;
      document.getElementById('lbTitle').textContent=t.name;
      document.getElementById('lbCounter').textContent=`${{lbIdx+1}} / ${{filtered.length}} ${{t.isFree?'• FREE':'• PRO'}}`;
      document.getElementById('lbUseBtn').href=getGeneratorUrl(t.url);
    }}
    document.addEventListener('keydown',e=>{{if(!document.getElementById('lightbox').classList.contains('active'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft')navLB(-1);if(e.key==='ArrowRight')navLB(1)}});
    render();
  </script>
'''
    html += html_footer()
    return html

# =============================================================
# GÉNÉRATION PRINCIPALE
# =============================================================

def generate_all():
    print("=" * 60)
    print("🚀 GabaritKDP Marketplace Generator v3.0 - HYBRID")
    print("=" * 60)
    print(f"📊 Excel: {EXCEL_FILE}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🔧 Mode A si: ≥{MIN_SUBSUB_COUNT} sous-sous-cat OU ≥{MIN_IMAGES_COUNT} images")
    print()
    
    # Charger les données
    print("📖 Loading Excel data...")
    files_df, hierarchy_df = load_data(EXCEL_FILE)
    print(f"   {len(files_df)} files loaded")
    
    # Construire la structure
    print("\n🏗️ Building structure with A/B detection...")
    structure = build_structure(files_df, hierarchy_df)
    
    # Stats
    mode_a_count = 0
    mode_b_count = 0
    for cat_data in structure.values():
        for sub_data in cat_data["subcategories"].values():
            if sub_data.get("mode") == "A":
                mode_a_count += 1
            else:
                mode_b_count += 1
    
    print(f"   Mode A (3 niveaux): {mode_a_count} sous-catégories")
    print(f"   Mode B (2 niveaux): {mode_b_count} sous-catégories")
    
    # Créer le dossier de sortie
    output = Path(OUTPUT_DIR)
    output.mkdir(parents=True, exist_ok=True)
    
    total_pages = 0
    total_templates = 0
    
    print("\n📝 Generating HTML pages...")
    
    for cat_name, cat_data in structure.items():
        cat_slug = cat_data["slug"]
        
        # Page catégorie
        (output / f"category-{cat_slug}.html").write_text(gen_category_page(cat_data), encoding='utf-8')
        print(f"✅ category-{cat_slug}.html ({cat_data['total']} templates)")
        total_pages += 1
        total_templates += cat_data['total']
        
        # Pages sous-catégories
        for sub_name, sub_data in cat_data['subcategories'].items():
            sub_slug = sub_data['slug']
            mode = sub_data.get('mode', 'B')
            
            # Page sous-catégorie
            fn = f"subcategory-{cat_slug}-{sub_slug}.html"
            (output / fn).write_text(gen_subcategory_page(cat_data, sub_data), encoding='utf-8')
            print(f"   {'📁' if mode == 'A' else '📄'} {fn} ({sub_data['total']}) [Mode {mode}]")
            total_pages += 1
            
            # Si Mode A : générer les pages gallery
            if mode == "A" and sub_data.get("subsubcategories"):
                for subsub_name, subsub_data in sub_data["subsubcategories"].items():
                    subsub_slug = subsub_data["slug"]
                    gfn = f"gallery-{cat_slug}-{sub_slug}-{subsub_slug}.html"
                    (output / gfn).write_text(gen_gallery_page(cat_data, sub_data, subsub_data), encoding='utf-8')
                    print(f"      └─ {gfn} ({subsub_data['total']})")
                    total_pages += 1
    
    # Export JSON
    print("\n📊 Exporting JSON...")
    json_data = {}
    for cat_name, cat_data in structure.items():
        json_data[cat_name] = {
            "name": cat_data["name"],
            "slug": cat_data["slug"],
            "total": cat_data["total"],
            "free": cat_data["free"],
            "icon": cat_data["icon"],
            "subcategories": {
                sub_name: {
                    "name": sub_data["name"],
                    "slug": sub_data["slug"],
                    "total": sub_data["total"],
                    "free": sub_data["free"],
                    "mode": sub_data.get("mode", "B"),
                    "subsubcategories": {
                        ss_name: {
                            "name": ss_data["name"],
                            "slug": ss_data["slug"],
                            "total": ss_data["total"],
                            "free": ss_data["free"],
                        }
                        for ss_name, ss_data in sub_data.get("subsubcategories", {}).items()
                    } if sub_data.get("mode") == "A" else {},
                    "filesCount": len(sub_data.get("files", []))
                }
                for sub_name, sub_data in cat_data["subcategories"].items()
            }
        }
    
    (output / "marketplace-data.json").write_text(json.dumps(json_data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ marketplace-data.json")
    
    print()
    print("=" * 60)
    print(f"🎉 DONE!")
    print(f"   📄 {total_pages} HTML pages")
    print(f"   🖼️  {total_templates} templates")
    print(f"   📁 Mode A: {mode_a_count} | Mode B: {mode_b_count}")
    print(f"   📂 {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    generate_all()
