NETLIFY UTF-8 PACK — HOW TO USE
================================

1) Placez le fichier `_headers` à la RACINE du dossier déployé sur Netlify
   (même niveau que index.html, ou dans le dossier de build type /dist si vous en avez un).
   Re-deploy.

2) Remplacez votre header par `header_utf8.html`.
   Assurez-vous que vos fichiers sont enregistrés en UTF-8 dans l’éditeur (VS Code : Save with Encoding → UTF-8).

3) Dans VOS pages (index.html, etc.), mettez tout en haut :
   <meta charset="UTF-8">
   <html lang="fr" translate="no">

4) (Optionnel) Ajoutez dans votre CSS :
   .notranslate { unicode-bidi: plaintext; }

Notes :
- Si le navigateur affichait des caractères bizarres (Ã©, ðŸ…), c’était un mauvais charset.
  `_headers` force Netlify à servir en UTF-8.
- Votre image garde son nom : "logo gabarit kdp pour site web.jpg".
  Netlify gère les espaces (ils s’afficheront comme %20 dans l’URL).
