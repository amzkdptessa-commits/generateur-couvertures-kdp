# ========================================
# SCRIPT FINAL - Remplacer images.gabaritkdp.com
# ========================================
# Ce script fait EXACTEMENT ce que ChatGPT recommande
# ========================================

Write-Host "🚀 Démarrage du remplacement images.gabaritkdp.com → cdn.gabaritkdp.com" -ForegroundColor Cyan
Write-Host ""

$count = 0

# ========================================
# 1. GALLERY.JSON
# ========================================

if (Test-Path "gallery.json") {
    Write-Host "📝 Traitement de gallery.json..." -ForegroundColor Yellow
    
    $content = Get-Content "gallery.json" -Raw
    $newContent = $content -replace 'https://images\.gabaritkdp\.com/', 'https://cdn.gabaritkdp.com/'
    
    if ($content -ne $newContent) {
        Set-Content "gallery.json" -Value $newContent -NoNewline
        Write-Host "   ✅ gallery.json modifié" -ForegroundColor Green
        $count++
    } else {
        Write-Host "   ⏭️  gallery.json déjà à jour" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  gallery.json introuvable" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 2. TOUS LES FICHIERS HTML ET JS
# ========================================

Write-Host "📝 Traitement des fichiers HTML et JS..." -ForegroundColor Yellow

Get-ChildItem -Recurse -Include *.html,*.js -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $content = Get-Content $_.FullName -Raw -ErrorAction Stop
        $newContent = $content -replace 'https://images\.gabaritkdp\.com/', 'https://cdn.gabaritkdp.com/'
        
        if ($content -ne $newContent) {
            Set-Content $_.FullName -Value $newContent -NoNewline
            Write-Host "   ✅ $($_.Name)" -ForegroundColor Green
            $count++
        }
    } catch {
        Write-Host "   ⚠️  Erreur avec $($_.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# ========================================
# 3. VÉRIFICATION
# ========================================

Write-Host "🔍 Vérification finale..." -ForegroundColor Yellow

$remaining = 0

# Vérifier s'il reste des images.gabaritkdp.com
Get-ChildItem -Include *.html,*.js,*.json -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "images\.gabaritkdp\.com" -ErrorAction SilentlyContinue
    if ($matches) {
        $remaining += $matches.Count
        Write-Host "   ⚠️  $($_.Name) contient encore $($matches.Count) occurrence(s)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ========================================
# 4. RÉSUMÉ
# ========================================

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ REMPLACEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Résumé :" -ForegroundColor Yellow
Write-Host "   - Fichiers modifiés : $count"
Write-Host "   - Occurrences restantes : $remaining"
Write-Host ""

if ($remaining -eq 0) {
    Write-Host "🎉 PARFAIT ! Aucune occurrence de images.gabaritkdp.com restante !" -ForegroundColor Green
} else {
    Write-Host "⚠️  Il reste des occurrences à corriger manuellement" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 PROCHAINES ÉTAPES (comme ChatGPT l'a dit) :" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Déploie sur Netlify :" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Fix: Remplace images.gabaritkdp.com par cdn.gabaritkdp.com'" -ForegroundColor Cyan
Write-Host "   git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Purge le cache Bunny :" -ForegroundColor White
Write-Host "   - Va sur panel.bunny.net" -ForegroundColor Cyan
Write-Host "   - Pull Zone gabaritkdp → Purge → Purge Everything" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  Teste cette URL :" -ForegroundColor White
Write-Host "   https://cdn.gabaritkdp.com/backgrounds/ANIMAUX/Loups/Loups/image_couverture_de_livres_animaux_loups_001.png" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Hard refresh ton site :" -ForegroundColor White
Write-Host "   Ctrl + F5" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Si l'URL du test (étape 3) s'affiche → C'EST GAGNÉ !" -ForegroundColor Green
Write-Host ""
