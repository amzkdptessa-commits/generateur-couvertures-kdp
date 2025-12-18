#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================
GabaritKDP Watermark Generator
=============================================================
Ajoute un watermark semi-transparent à toutes les images.

USAGE:
    python add-watermark.py

CONFIGURATION:
    - Modifier SOURCE_DIR pour pointer vers tes images originales
    - Modifier OUTPUT_DIR pour le dossier de sortie
    - Modifier WATERMARK_TEXT pour le texte du watermark

REQUIRES:
    pip install Pillow --break-system-packages
=============================================================
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

# =============================================================
# CONFIGURATION - MODIFIER ICI
# =============================================================

# Dossier source (tes images originales)
SOURCE_DIR = r"D:\Couverture de livres"

# Dossier de sortie (images avec watermark)
OUTPUT_DIR = r"D:\Couverture de livres - Watermarked"

# Texte du watermark
WATERMARK_TEXT = "GabaritKDP"

# Opacité du watermark (0.0 = invisible, 1.0 = opaque)
# Recommandé: 0.15 à 0.30 pour être visible mais pas gênant
WATERMARK_OPACITY = 0.25

# Position du watermark: "center", "bottom-right", "bottom-left", "diagonal", "tiled"
WATERMARK_POSITION = "diagonal"

# Couleur du watermark (R, G, B)
WATERMARK_COLOR = (255, 255, 255)  # Blanc

# Taille du texte en pourcentage de la largeur de l'image
# Pour "diagonal" et "center": 15-25% recommandé
# Pour "tiled": 5-10% recommandé
TEXT_SIZE_PERCENT = 20

# Extensions d'images à traiter
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}

# =============================================================
# FONCTIONS
# =============================================================

def get_font(size: int):
    """Charge une police ou utilise la police par défaut."""
    # Liste des polices à essayer
    font_paths = [
        # Windows
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        # macOS
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except:
                continue
    
    # Fallback: police par défaut (petite)
    print("⚠️  Aucune police TrueType trouvée, utilisation de la police par défaut")
    return ImageFont.load_default()


def add_watermark_center(image: Image.Image, text: str, opacity: float, color: tuple, size_percent: float) -> Image.Image:
    """Ajoute un watermark centré."""
    # Créer une copie en RGBA
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    width, height = image.size
    
    # Calculer la taille du texte
    font_size = int(width * size_percent / 100)
    font = get_font(font_size)
    
    # Créer un calque transparent pour le watermark
    watermark_layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    
    # Calculer la position centrée
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Dessiner le texte avec opacité
    alpha = int(255 * opacity)
    text_color = (*color, alpha)
    
    # Ajouter une ombre légère pour meilleure lisibilité
    shadow_color = (0, 0, 0, alpha // 2)
    draw.text((x + 3, y + 3), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=text_color)
    
    # Fusionner les calques
    return Image.alpha_composite(image, watermark_layer)


def add_watermark_diagonal(image: Image.Image, text: str, opacity: float, color: tuple, size_percent: float) -> Image.Image:
    """Ajoute un watermark en diagonale (plus difficile à supprimer)."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    width, height = image.size
    
    # Calculer la taille du texte
    font_size = int(width * size_percent / 100)
    font = get_font(font_size)
    
    # Créer un calque plus grand pour la rotation
    diagonal = int((width**2 + height**2)**0.5)
    watermark_layer = Image.new('RGBA', (diagonal, diagonal), (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    
    # Calculer la taille du texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Position centrée sur le calque diagonal
    x = (diagonal - text_width) // 2
    y = (diagonal - text_height) // 2
    
    # Dessiner le texte
    alpha = int(255 * opacity)
    text_color = (*color, alpha)
    shadow_color = (0, 0, 0, alpha // 2)
    
    draw.text((x + 3, y + 3), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=text_color)
    
    # Rotation de 45 degrés
    watermark_layer = watermark_layer.rotate(45, resample=Image.BICUBIC, expand=False)
    
    # Recadrer pour correspondre à l'image originale
    crop_x = (diagonal - width) // 2
    crop_y = (diagonal - height) // 2
    watermark_layer = watermark_layer.crop((crop_x, crop_y, crop_x + width, crop_y + height))
    
    return Image.alpha_composite(image, watermark_layer)


def add_watermark_tiled(image: Image.Image, text: str, opacity: float, color: tuple, size_percent: float) -> Image.Image:
    """Ajoute des watermarks en mosaïque (très difficile à supprimer)."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    width, height = image.size
    
    # Taille du texte plus petite pour le mosaïque
    font_size = int(width * size_percent / 100)
    font = get_font(font_size)
    
    # Créer le calque watermark
    watermark_layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    
    # Calculer l'espacement
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    spacing_x = text_width + 100
    spacing_y = text_height + 80
    
    alpha = int(255 * opacity)
    text_color = (*color, alpha)
    
    # Dessiner en mosaïque avec rotation alternée
    y = -spacing_y
    row = 0
    while y < height + spacing_y:
        x = -spacing_x + (row % 2) * (spacing_x // 2)  # Décalage alterné
        while x < width + spacing_x:
            # Créer un petit calque pour ce texte
            tile = Image.new('RGBA', (text_width + 20, text_height + 20), (0, 0, 0, 0))
            tile_draw = ImageDraw.Draw(tile)
            tile_draw.text((10, 10), text, font=font, fill=text_color)
            
            # Rotation légère alternée
            angle = 30 if (row + int(x / spacing_x)) % 2 == 0 else -30
            tile = tile.rotate(angle, resample=Image.BICUBIC, expand=True)
            
            # Coller sur le calque
            paste_x = int(x - tile.width // 2)
            paste_y = int(y - tile.height // 2)
            watermark_layer.paste(tile, (paste_x, paste_y), tile)
            
            x += spacing_x
        y += spacing_y
        row += 1
    
    return Image.alpha_composite(image, watermark_layer)


def add_watermark_corner(image: Image.Image, text: str, opacity: float, color: tuple, size_percent: float, position: str) -> Image.Image:
    """Ajoute un watermark dans un coin."""
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    width, height = image.size
    
    font_size = int(width * size_percent / 100)
    font = get_font(font_size)
    
    watermark_layer = Image.new('RGBA', image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark_layer)
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    margin = 20
    
    if position == "bottom-right":
        x = width - text_width - margin
        y = height - text_height - margin
    elif position == "bottom-left":
        x = margin
        y = height - text_height - margin
    elif position == "top-right":
        x = width - text_width - margin
        y = margin
    else:  # top-left
        x = margin
        y = margin
    
    alpha = int(255 * opacity)
    text_color = (*color, alpha)
    shadow_color = (0, 0, 0, alpha // 2)
    
    draw.text((x + 2, y + 2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=text_color)
    
    return Image.alpha_composite(image, watermark_layer)


def add_watermark(image: Image.Image, text: str, opacity: float, color: tuple, size_percent: float, position: str) -> Image.Image:
    """Ajoute un watermark selon la position choisie."""
    if position == "center":
        return add_watermark_center(image, text, opacity, color, size_percent)
    elif position == "diagonal":
        return add_watermark_diagonal(image, text, opacity, color, size_percent)
    elif position == "tiled":
        return add_watermark_tiled(image, text, opacity, color, size_percent)
    else:
        return add_watermark_corner(image, text, opacity, color, size_percent, position)


def process_images():
    """Traite toutes les images du dossier source."""
    source = Path(SOURCE_DIR)
    output = Path(OUTPUT_DIR)
    
    if not source.exists():
        print(f"❌ Erreur: Le dossier source n'existe pas: {SOURCE_DIR}")
        sys.exit(1)
    
    # Compter les images
    all_images = []
    for ext in IMAGE_EXTENSIONS:
        all_images.extend(source.rglob(f"*{ext}"))
        all_images.extend(source.rglob(f"*{ext.upper()}"))
    
    total = len(all_images)
    
    print("=" * 60)
    print("🖼️  GabaritKDP Watermark Generator")
    print("=" * 60)
    print(f"📂 Source: {SOURCE_DIR}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"📝 Texte: {WATERMARK_TEXT}")
    print(f"🎨 Position: {WATERMARK_POSITION}")
    print(f"👁️  Opacité: {WATERMARK_OPACITY * 100}%")
    print(f"📐 Taille: {TEXT_SIZE_PERCENT}%")
    print(f"\n🔍 {total} images trouvées")
    print("=" * 60)
    
    if total == 0:
        print("⚠️  Aucune image trouvée!")
        return
    
    processed = 0
    errors = 0
    
    for img_path in all_images:
        try:
            # Calculer le chemin de sortie (même structure de dossiers)
            relative_path = img_path.relative_to(source)
            output_path = output / relative_path
            
            # Créer le dossier de sortie si nécessaire
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Charger l'image
            with Image.open(img_path) as img:
                # Ajouter le watermark
                watermarked = add_watermark(
                    img,
                    WATERMARK_TEXT,
                    WATERMARK_OPACITY,
                    WATERMARK_COLOR,
                    TEXT_SIZE_PERCENT,
                    WATERMARK_POSITION
                )
                
                # Convertir en RGB si nécessaire pour JPEG
                if output_path.suffix.lower() in {'.jpg', '.jpeg'}:
                    if watermarked.mode == 'RGBA':
                        # Créer un fond blanc et coller l'image dessus
                        background = Image.new('RGB', watermarked.size, (255, 255, 255))
                        background.paste(watermarked, mask=watermarked.split()[3])
                        watermarked = background
                
                # Sauvegarder
                if output_path.suffix.lower() == '.png':
                    watermarked.save(output_path, 'PNG', optimize=True)
                elif output_path.suffix.lower() in {'.jpg', '.jpeg'}:
                    watermarked.save(output_path, 'JPEG', quality=92, optimize=True)
                elif output_path.suffix.lower() == '.webp':
                    watermarked.save(output_path, 'WEBP', quality=90)
                else:
                    watermarked.save(output_path)
            
            processed += 1
            
            # Afficher la progression
            percent = (processed / total) * 100
            print(f"\r✅ {processed}/{total} ({percent:.1f}%) - {relative_path.name[:40]}", end="", flush=True)
            
        except Exception as e:
            errors += 1
            print(f"\n❌ Erreur sur {img_path.name}: {e}")
    
    print("\n")
    print("=" * 60)
    print(f"🎉 TERMINÉ!")
    print(f"   ✅ {processed} images traitées")
    if errors > 0:
        print(f"   ❌ {errors} erreurs")
    print(f"   📂 Sortie: {OUTPUT_DIR}")
    print("=" * 60)


# =============================================================
# MAIN
# =============================================================

if __name__ == "__main__":
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("❌ Pillow n'est pas installé!")
        print("   Exécutez: pip install Pillow --break-system-packages")
        sys.exit(1)
    
    process_images()
