@echo off
echo ================================================
echo    MISE A JOUR AUTOMATIQUE TAILWIND CSS
echo    Remplacement CDN vers fichier local
echo ================================================
echo.

REM Parcourir tous les fichiers HTML
for %%f in (*.html) do (
    echo 🔄 Traitement de %%f...
    
    REM Créer une sauvegarde
    copy "%%f" "%%f.backup" >nul
    
    REM Remplacer la ligne Tailwind CDN par le fichier local
    powershell -Command "(Get-Content '%%f') -replace '<script src=\"https://cdn\.tailwindcss\.com\"></script>', '<link rel=\"stylesheet\" href=\"./dist/tailwind.min.css\">' | Set-Content '%%f'"
    
    echo ✅ %%f mis à jour
)

echo.
echo ================================================
echo ✅ TOUS LES FICHIERS HTML ONT ÉTÉ MIS À JOUR !
echo.
echo 📁 Sauvegardes créées (.backup)
echo 🔗 CDN Tailwind remplacé par fichier local
echo 🚀 Votre site est maintenant optimisé !
echo ================================================
echo.
echo Appuyez sur une touche pour fermer...
pause >nul