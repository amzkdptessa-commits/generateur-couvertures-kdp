@echo off
chcp 65001 > nul
echo ========================================
echo   CORRECTION BUNNY CDN URLs
echo ========================================
echo.

echo 📝 Remplacement des URLs dans gallery.json...
if exist gallery.json (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content 'gallery.json' -Raw) -replace 'https://pub-7e9ed5303066447d83c33d68f896441b\.r2\.dev', 'https://cdn.gabaritkdp.com' -replace 'https://images\.gabaritkdp\.com', 'https://cdn.gabaritkdp.com' -replace 'https://gabaritkdp\.b-cdn\.net', 'https://cdn.gabaritkdp.com' -replace 'https://gabaritkdp-images\.b-cdn\.net', 'https://cdn.gabaritkdp.com' | Set-Content 'gallery.json' -NoNewline"
    echo    ✅ gallery.json corrigé
) else (
    echo    ⚠️  gallery.json non trouvé
)

echo.
echo 📝 Remplacement des URLs dans les fichiers HTML...
echo.

for %%f in (*.html) do (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content '%%f' -Raw) -replace 'https://pub-7e9ed5303066447d83c33d68f896441b\.r2\.dev', 'https://cdn.gabaritkdp.com' -replace 'https://images\.gabaritkdp\.com', 'https://cdn.gabaritkdp.com' -replace 'https://gabaritkdp\.b-cdn\.net', 'https://cdn.gabaritkdp.com' -replace 'https://gabaritkdp-images\.b-cdn\.net', 'https://cdn.gabaritkdp.com' | Set-Content '%%f' -NoNewline"
    echo    ✅ %%f
)

echo.
echo ========================================
echo   ✅ CORRECTION TERMINÉE !
echo ========================================
echo.
echo Toutes les URLs pointent maintenant vers:
echo https://cdn.gabaritkdp.com
echo.
echo Prochaines étapes:
echo 1. Va dans Bunny CDN et supprime images.gabaritkdp.com
echo 2. Purge le cache Bunny
echo 3. Déploie sur Netlify
echo.
pause
