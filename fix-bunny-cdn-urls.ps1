# ========================================
# SCRIPT DE CORRECTION BUNNY CDN URLs
# ========================================
# Ce script remplace TOUTES les URLs CDN par cdn.gabaritkdp.com
# dans tous les fichiers HTML et gallery.json
# ========================================

Write-Host "🚀 Démarrage de la correction des URLs Bunny CDN..." -ForegroundColor Cyan
Write-Host ""

# Compteurs
$htmlCount = 0
$jsonCount = 0

# ========================================
# 1. CORRECTION DE gallery.json
# ========================================

if (Test-Path "gallery.json") {
    Write-Host "📝 Correction de gallery.json..." -ForegroundColor Yellow
    
    $gallery = Get-Content "gallery.json" -Raw
    
    # Remplace toutes les variantes d'URLs par cdn.gabaritkdp.com
    $gallery = $gallery -replace 'https://pub-7e9ed5303066447d83c33d68f896441b\.r2\.dev', 'https://cdn.gabaritkdp.com'
    $gallery = $gallery -replace 'https://images\.gabaritkdp\.com', 'https://cdn.gabaritkdp.com'
    $gallery = $gallery -replace 'https://gabaritkdp\.b-cdn\.net', 'https://cdn.gabaritkdp.com'
    $gallery = $gallery -replace 'https://gabaritkdp-images\.b-cdn\.net', 'https://cdn.gabaritkdp.com'
    
    Set-Content "gallery.json" -Value $gallery -NoNewline
    Write-Host "   ✅ gallery.json corrigé" -ForegroundColor Green
    $jsonCount++
} else {
    Write-Host "   ⚠️  gallery.json non trouvé" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 2. CORRECTION DE TOUS LES FICHIERS HTML
# ========================================

Write-Host "📝 Correction des fichiers HTML..." -ForegroundColor Yellow

Get-ChildItem -Filter "*.html" | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        
        # Vérifie si le fichier contient des URLs à remplacer
        if ($content -match 'r2\.dev|images\.gabaritkdp|gabaritkdp\.b-cdn\.net|gabaritkdp-images\.b-cdn\.net') {
            
            # Remplace toutes les variantes d'URLs par cdn.gabaritkdp.com
            $newContent = $content -replace 'https://pub-7e9ed5303066447d83c33d68f896441b\.r2\.dev', 'https://cdn.gabaritkdp.com'
            $newContent = $newContent -replace 'https://images\.gabaritkdp\.com', 'https://cdn.gabaritkdp.com'
            $newContent = $newContent -replace 'https://gabaritkdp\.b-cdn\.net', 'https://cdn.gabaritkdp.com'
            $newContent = $newContent -replace 'https://gabaritkdp-images\.b-cdn\.net', 'https://cdn.gabaritkdp.com'
            
            Set-Content $_.FullName -Value $newContent -NoNewline
            Write-Host "   ✅ $($_.Name)" -ForegroundColor Green
            $htmlCount++
        } else {
            Write-Host "   ⏭️  $($_.Name) (déjà à jour)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ❌ Erreur avec $($_.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# ========================================
# 3. RÉSUMÉ
# ========================================

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ CORRECTION TERMINÉE !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Résumé :" -ForegroundColor Yellow
Write-Host "   - gallery.json : $jsonCount fichier(s) corrigé(s)"
Write-Host "   - Fichiers HTML : $htmlCount fichier(s) corrigé(s)"
Write-Host ""
Write-Host "🎯 Toutes les URLs pointent maintenant vers :" -ForegroundColor Yellow
Write-Host "   https://cdn.gabaritkdp.com" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 4. VÉRIFICATION POST-CORRECTION
# ========================================

Write-Host "🔍 Vérification rapide..." -ForegroundColor Yellow

$remainingR2 = (Get-ChildItem -Filter "*.html" | Select-String "r2\.dev").Count
$remainingImages = (Get-ChildItem -Filter "*.html" | Select-String "images\.gabaritkdp\.com").Count
$remainingBcdn = (Get-ChildItem -Filter "*.html" | Select-String "gabaritkdp\.b-cdn\.net" | Where-Object { $_.Line -notmatch "CNAME" }).Count

if ($remainingR2 -eq 0 -and $remainingImages -eq 0 -and $remainingBcdn -eq 0) {
    Write-Host "   ✅ Aucune ancienne URL détectée !" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Anciennes URLs encore présentes :" -ForegroundColor Yellow
    if ($remainingR2 -gt 0) { Write-Host "      - R2 Cloudflare : $remainingR2 occurrence(s)" }
    if ($remainingImages -gt 0) { Write-Host "      - images.gabaritkdp.com : $remainingImages occurrence(s)" }
    if ($remainingBcdn -gt 0) { Write-Host "      - gabaritkdp.b-cdn.net : $remainingBcdn occurrence(s)" }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 PROCHAINES ÉTAPES :" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Dans Bunny CDN → Pull Zone → Hostnames :" -ForegroundColor White
Write-Host "   ❌ SUPPRIME 'images.gabaritkdp.com' de la Pull Zone" -ForegroundColor Red
Write-Host ""
Write-Host "2️⃣  Dans Bunny CDN → Pull Zone :" -ForegroundColor White
Write-Host "   🗑️  Purge le cache (Purge All Files)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Teste une image :" -ForegroundColor White
Write-Host "   curl -I https://cdn.gabaritkdp.com/backgrounds/ANIMAUX/Loups/Wolves%20(1).png" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Déploie sur Netlify :" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Fix Bunny CDN URLs to cdn.gabaritkdp.com'" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Bon courage !" -ForegroundColor Green
Write-Host ""
