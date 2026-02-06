#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================
GabaritKDP Marketplace Generator v2.0
=============================================================
Génère automatiquement les pages HTML de la marketplace
à partir de la structure de dossiers d'images.

USAGE:
  python generate-marketplace.py

Modifier SOURCE_DIR et OUTPUT_DIR ci-dessous avant exécution.
=============================================================
"""

import os
import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# =============================================================
# CONFIGURATION - À MODIFIER
# =============================================================

SOURCE_DIR = r"D:\Couverture de livres"
OUTPUT_DIR = r".\output"
IMAGE_BASE_URL = "https://images.gabaritkdp.com/"
FREE_PERCENTAGE = 0.20

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

CATEGORY_ICONS = {
    "ROMANCE": "💕", "THRILLER": "🔪", "FANTASY": "🐉", "MYSTERY": "🔍",
    "SCI-FI": "🚀", "HISTORICAL": "🏰", "HORROR": "👻", "ART": "🎨",
    "VINTAGE": "📜", "VOYAGES": "✈️", "RELIGIONS": "✝️", "TEXTURES": "🧱",
    "PLANNERS": "📅", "COLORIAGES": "🖍️", "ANIMAUX": "🐾", "BOHEME": "🌸",
    "HIPPIE": "☮️", "CARTOON": "🎬", "BUSINESS": "💼", "FULL COVER": "📚",
    "RECETTES": "🍳", "CHILDREN": "👶", "EBOOKS": "📱", "INTERIORS": "📖",
    "FLEURS": "🌸", "PAYSAGES": "🏞️",
}

CATEGORY_GRADIENTS = {
    "ROMANCE": "linear-gradient(135deg,#fdf2f8 0%,#fce7f3 50%,#fbcfe8 100%)",
    "THRILLER": "linear-gradient(135deg,#f1f5f9 0%,#e2e8f0 50%,#cbd5e1 100%)",
    "FANTASY": "linear-gradient(135deg,#faf5ff 0%,#f3e8ff 50%,#e9d5ff 100%)",
    "PLANNERS": "linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#bfdbfe 100%)",
    "DEFAULT": "linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%)",
}

# =============================================================
# UTILITAIRES
# =============================================================

def slugify(text: str) -> str:
    replacements = {
        'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a',
        'è':'e','é':'e','ê':'e','ë':'e',
        'ì':'i','í':'i','î':'i','ï':'i',
        'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o',
        'ù':'u','ú':'u','û':'u','ü':'u',
        'ç':'c','ñ':'n',
        'À':'a','Á':'a','Â':'a','Ã':'a','Ä':'a','Å':'a',
        'È':'e','É':'e','Ê':'e','Ë':'e',
        'Ì':'i','Í':'i','Î':'i','Ï':'i',
        'Ò':'o','Ó':'o','Ô':'o','Õ':'o','Ö':'o',
        'Ù':'u','Ú':'u','Û':'u','Ü':'u',
        'Ç':'c','Ñ':'n',
    }
    text_clean = text.lower()
    for accent, replacement in replacements.items():
        text_clean = text_clean.replace(accent, replacement)
    text_clean = re.sub(r'[^\w\s-]', '', text_clean)
    text_clean = re.sub(r'[-\s]+', '-', text_clean)
    return text_clean.strip('-')

def is_image(f): return Path(f).suffix.lower() in IMAGE_EXTENSIONS
def get_icon(c): return CATEGORY_ICONS.get(c.upper(), "📁")
def get_gradient(c): return CATEGORY_GRADIENTS.get(c.upper(), CATEGORY_GRADIENTS["DEFAULT"])

# =============================================================
# SCAN
# =============================================================

def scan_directory(source_dir: str) -> Dict[str, Any]:
    source_path = Path(source_dir)
    if not source_path.exists():
        raise FileNotFoundError(f"Dossier introuvable: {source_dir}")
    
    structure = {}
    
    for category_dir in sorted(source_path.iterdir()):
        if not category_dir.is_dir() or category_dir.name.startswith('.'):
            continue
        
        cat_name = category_dir.name
        cat_slug = slugify(cat_name)
        print(f"📁 {cat_name}")
        
        subcategories = {}
        cat_total = cat_free = 0
        
        for subcat_dir in sorted(category_dir.iterdir()):
            if not subcat_dir.is_dir() or subcat_dir.name.startswith('.'):
                continue
            
            sub_name = subcat_dir.name
            sub_slug = slugify(sub_name)
            
            files = []
            for fp in sorted(subcat_dir.iterdir()):
                if fp.is_file() and is_image(fp.name):
                    stat = fp.stat()
                    files.append({
                        "name": fp.stem,
                        "file": fp.name,
                        "fileSlug": slugify(fp.stem) + fp.suffix.lower(),
                        "size": stat.st_size,
                    })
            
            if not files:
                continue
            
            free_count = max(1, int(len(files) * FREE_PERCENTAGE))
            for i, f in enumerate(files):
                f["isFree"] = i < free_count
            
            subcategories[sub_name] = {
                "name": sub_name,
                "slug": sub_slug,
                "total": len(files),
                "free": free_count,
                "files": files,
                "previewImage": files[0]["file"],
                "previewImageSlug": files[0]["fileSlug"],
            }
            
            cat_total += len(files)
            cat_free += free_count
            print(f"   └─ {sub_name}: {len(files)}")
        
        if subcategories:
            structure[cat_name] = {
                "name": cat_name,
                "slug": cat_slug,
                "total": cat_total,
                "free": cat_free,
                "icon": get_icon(cat_name),
                "gradient": get_gradient(cat_name),
                "subcategories": subcategories,
            }
    
    return structure

# =============================================================
# HTML TEMPLATES
# =============================================================

def html_head(title, desc, gradient):
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
    .breadcrumb{{display:flex;gap:8px;font-size:.9rem;color:#64748b;margin-bottom:1rem}}
    .breadcrumb a{{color:#FF9900;text-decoration:none}}
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

def gen_category_page(cat_data):
    name, slug, icon = cat_data["name"], cat_data["slug"], cat_data["icon"]
    gradient, total, free = cat_data["gradient"], cat_data["total"], cat_data["free"]
    subcats = cat_data["subcategories"]
    
    cards = ""
    for sub_name, sub_data in subcats.items():
        preview_url = f"{IMAGE_BASE_URL}{slug}/{sub_data['slug']}/{sub_data['previewImageSlug']}"
        page_link = f"subcategory-{slug}-{sub_data['slug']}.html"
        
        badge = ""
        if sub_data["total"] > 500: badge = '<span class="category-badge badge-best">BEST SELLER</span>'
        elif sub_data["total"] > 100: badge = '<span class="category-badge badge-popular">POPULAR</span>'
        elif sub_data["total"] > 50: badge = '<span class="category-badge badge-new">NEW</span>'
        
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
# PAGE SOUS-CATÉGORIE
# =============================================================

def gen_subcategory_page(cat_data, sub_data):
    cat_name, cat_slug, cat_icon = cat_data["name"], cat_data["slug"], cat_data["icon"]
    gradient = cat_data["gradient"]
    sub_name, sub_slug = sub_data["name"], sub_data["slug"]
    total, free, files = sub_data["total"], sub_data["free"], sub_data["files"]
    
    files_json = json.dumps([{"name":f["name"],"file":f["fileSlug"],"size":f["size"],"isFree":f["isFree"]} for f in files], ensure_ascii=False)
    image_base = f"{IMAGE_BASE_URL}{cat_slug}/{sub_slug}/"
    
    html = html_head(f"{cat_name} → {sub_name}", f"{total} templates", gradient)
    html += '''
  <style>
    .template-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .template-card{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:4/3;cursor:pointer;transition:.3s;box-shadow:0 4px 15px rgba(0,0,0,.08);background:#f8fafc;border:1px solid #e2e8f0}
    .template-card:hover{transform:translateY(-6px);box-shadow:0 15px 35px rgba(0,0,0,.12);border-color:#FF9900}
    .template-card img{width:100%;height:100%;object-fit:cover;transition:.4s}
    .template-card:hover img{transform:scale(1.05)}
    .template-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.8),transparent 50%);opacity:0;transition:.3s;display:flex;flex-direction:column;justify-content:flex-end;padding:1rem}
    .template-card:hover .template-overlay{opacity:1}
    .template-name{font-size:.875rem;font-weight:600;color:#fff}
    .template-size{font-size:.75rem;color:#FF9900;margin-top:.25rem}
    .free-badge{position:absolute;top:.75rem;left:.75rem;background:#10b981;color:#fff;padding:.25rem .5rem;border-radius:6px;font-size:.7rem;font-weight:700}
    .lightbox{position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:none;align-items:center;justify-content:center}
    .lightbox.active{display:flex}
    .lightbox img{max-width:90vw;max-height:85vh;object-fit:contain;border-radius:8px}
    .lightbox-close{position:absolute;top:2rem;right:2rem;background:none;border:none;color:#fff;font-size:2rem;cursor:pointer}
    .lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.1);border:none;color:#fff;font-size:1.5rem;padding:1rem;cursor:pointer;border-radius:8px}
    .lightbox-nav:hover{background:#FF9900}
    .lightbox-prev{left:2rem}.lightbox-next{right:2rem}
    .lightbox-info{position:absolute;bottom:2rem;left:0;right:0;text-align:center;color:#fff}
    .search-bar{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}
    .search-input{flex:1;min-width:250px;padding:.75rem 1rem;border:2px solid #e2e8f0;border-radius:10px}
    .search-input:focus{outline:none;border-color:#FF9900}
    .filter-btn{padding:.75rem 1.25rem;background:#f1f5f9;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer}
    .filter-btn:hover,.filter-btn.active{background:#FF9900;border-color:#FF9900;color:#fff}
    .pagination{display:flex;justify-content:center;gap:.5rem;margin-top:2rem}
    .page-btn{padding:.5rem 1rem;border:2px solid #e2e8f0;background:#fff;border-radius:8px;cursor:pointer}
    .page-btn:hover,.page-btn.active{background:#FF9900;border-color:#FF9900;color:#fff}
    .page-btn:disabled{opacity:.5;cursor:not-allowed}
  </style>
'''
    html += f'''
  <section class="hero-gradient py-10">
    <div class="max-w-7xl mx-auto px-4">
      <nav class="breadcrumb">
        <a href="marketplace.html">Marketplace</a> <span>›</span>
        <a href="category-{cat_slug}.html">{cat_name}</a> <span>›</span>
        <span class="font-medium text-gray-900">{sub_name}</span>
      </nav>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            <span class="text-4xl mr-2">{cat_icon}</span> {cat_name} → <span style="color:#FF9900">{sub_name}</span>
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
    <img id="lbImg" onclick="event.stopPropagation()">
    <button class="lightbox-nav lightbox-next" onclick="event.stopPropagation();navLB(1)"><i class="fas fa-chevron-right"></i></button>
    <div class="lightbox-info"><div id="lbTitle" style="font-weight:600"></div><div id="lbCounter" style="color:#94a3b8;font-size:.875rem"></div></div>
  </div>
  <section class="py-8 bg-gray-50 text-center">
    <a href="category-{cat_slug}.html" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-arrow-left"></i> Back to {cat_name}</a>
    <a href="marketplace.html" class="inline-flex items-center gap-2 px-5 py-2.5 ml-2 bg-white border-2 border-gray-200 rounded-lg font-semibold"><i class="fas fa-th-large"></i> All Categories</a>
    <a href="generator.html" class="inline-flex items-center gap-2 px-5 py-2.5 ml-2 text-white font-semibold rounded-lg" style="background:linear-gradient(135deg,#10b981,#059669)"><i class="fas fa-magic"></i> Create</a>
  </section>
  <script>
    const templates={files_json};
    const BASE="{image_base}";
    const PER_PAGE=24;
    let page=1,filtered=[...templates],filter='all',lbIdx=0;
    function formatSize(b){{return (b/1024/1024).toFixed(2)+' MB'}}
    function render(){{
      const start=(page-1)*PER_PAGE,end=start+PER_PAGE;
      const items=filtered.slice(start,end);
      document.getElementById('grid').innerHTML=items.map((t,i)=>`
        <div class="template-card" onclick="openLB(${{start+i}})">
          ${{t.isFree?'<span class="free-badge">FREE</span>':''}}
          <img src="${{BASE}}${{encodeURIComponent(t.file)}}" alt="${{t.name}}" loading="lazy">
          <div class="template-overlay">
            <span class="template-name">${{t.name}}</span>
            <span class="template-size">${{formatSize(t.size)}}</span>
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
    function openLB(i){{lbIdx=i;const t=filtered[i];document.getElementById('lbImg').src=BASE+encodeURIComponent(t.file);document.getElementById('lbTitle').textContent=t.name;document.getElementById('lbCounter').textContent=`${{i+1}}/${{filtered.length}}`;document.getElementById('lightbox').classList.add('active');document.body.style.overflow='hidden'}}
    function closeLB(e){{if(e&&e.target!==e.currentTarget)return;document.getElementById('lightbox').classList.remove('active');document.body.style.overflow=''}}
    function navLB(d){{lbIdx=(lbIdx+d+filtered.length)%filtered.length;const t=filtered[lbIdx];document.getElementById('lbImg').src=BASE+encodeURIComponent(t.file);document.getElementById('lbTitle').textContent=t.name;document.getElementById('lbCounter').textContent=`${{lbIdx+1}}/${{filtered.length}}`}}
    document.addEventListener('keydown',e=>{{if(!document.getElementById('lightbox').classList.contains('active'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft')navLB(-1);if(e.key==='ArrowRight')navLB(1)}});
    render();
  </script>
'''
    html += html_footer()
    return html

# =============================================================
# MAIN
# =============================================================

def main():
    print("="*60)
    print("🚀 GabaritKDP Marketplace Generator v2.0")
    print("="*60)
    print(f"📂 Source: {SOURCE_DIR}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print()
    
    structure = scan_directory(SOURCE_DIR)
    if not structure:
        print("❌ Aucune catégorie trouvée!")
        return
    
    output = Path(OUTPUT_DIR)
    output.mkdir(parents=True, exist_ok=True)
    
    total_pages = total_templates = 0
    print("\n📝 Generating HTML...")
    
    for cat_name, cat_data in structure.items():
        # Category page
        (output / f"category-{cat_data['slug']}.html").write_text(gen_category_page(cat_data), encoding='utf-8')
        print(f"✅ category-{cat_data['slug']}.html ({cat_data['total']})")
        total_pages += 1
        total_templates += cat_data['total']
        
        # Subcategory pages
        for sub_name, sub_data in cat_data['subcategories'].items():
            fn = f"subcategory-{cat_data['slug']}-{sub_data['slug']}.html"
            (output / fn).write_text(gen_subcategory_page(cat_data, sub_data), encoding='utf-8')
            print(f"   └─ {fn} ({sub_data['total']})")
            total_pages += 1
    
    # JSON export
    json_data = {
        cat_name: {
            "name": d["name"], "slug": d["slug"], "total": d["total"], "free": d["free"], "icon": d["icon"],
            "subcategories": {
                sn: {"name": sd["name"], "slug": sd["slug"], "total": sd["total"], "free": sd["free"],
                     "previewImage": sd["previewImageSlug"],
                     "files": [{"name":f["name"],"file":f["fileSlug"],"size":f["size"],"isFree":f["isFree"]} for f in sd["files"]]}
                for sn, sd in d["subcategories"].items()
            }
        } for cat_name, d in structure.items()
    }
    (output / "marketplace-data.json").write_text(json.dumps(json_data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n✅ marketplace-data.json")
    
    print(f"\n{'='*60}")
    print(f"🎉 DONE! {total_pages} pages, {total_templates} templates")
    print(f"📂 {OUTPUT_DIR}")
    print("="*60)

if __name__ == "__main__":
    main()