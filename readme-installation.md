# 🎨 Intégration Canva Designs - Package Complet

## 📦 Contenu du package

Voici tous les fichiers nécessaires pour l'intégration complète de Canva dans votre générateur KDP :

1. **generator-with-canva.html** - Votre générateur modifié avec l'intégration Canva complète
2. **canva-designs-fetcher.js** - Script JavaScript pour récupérer et afficher les designs Canva
3. **callback.html** - Page de callback OAuth pour l'authentification Canva

## 🚀 Installation

### Étape 1 : Remplacer les fichiers

1. **Sauvegardez votre fichier generator.html actuel** (au cas où)
2. Remplacez `generator.html` par `generator-with-canva.html`
3. Renommez `generator-with-canva.html` en `generator.html`

### Étape 2 : Ajouter les fichiers nécessaires

Placez ces fichiers dans le **même dossier** que generator.html :

```
votre-site/
├── generator.html (le nouveau fichier modifié)
├── canva-designs-fetcher.js
├── auth/
│   └── callback.html (ou callback.html à la racine selon votre config)
└── logo-gabarit-kdp-site-web.png (votre logo existant)
```

### Étape 3 : Configurer l'URL de callback

Dans votre fichier `generator.html`, vérifiez la configuration OAuth Canva (ligne ~33) :

```javascript
const CANVA_CONFIG = {
  CLIENT_ID: 'OC-AZnaRLvMwpXk', // Votre CLIENT ID
  SITE_ORIGIN: window.location.origin, // Détection automatique
  CALLBACK_PATH: '/auth/callback.html', // ⚠️ Adaptez selon votre structure
  OAUTH_URL: 'https://www.canva.com/api/oauth/authorize',
  SCOPES: ['design:meta:read', 'design:content:read', 'asset:read']
};
```

**Important** : Le `CALLBACK_PATH` doit correspondre à l'emplacement réel de votre fichier callback.html

### Étape 4 : Configurer le Cloudflare Worker

Dans le fichier `callback.html`, vérifiez l'URL du Worker (ligne ~21) :

```javascript
const CONFIG = {
  WORKER_URL: 'https://canva-token.amzkdptessa.workers.dev', // ⚠️ Votre Worker URL
  SITE_ORIGIN: window.location.origin,
  CALLBACK_PATH: '/auth/callback.html',
  FINAL_REDIRECT: '/generator.html',
  REDIRECT_DELAY: 1800
};
```

## 🎯 Utilisation

### 1. Connexion à Canva

L'utilisateur clique sur le bouton "Se connecter à Canva" dans votre interface.

### 2. Autorisation

- L'utilisateur est redirigé vers Canva
- Il autorise l'accès à ses designs
- Il est redirigé vers votre page de callback
- Le token est stocké automatiquement

### 3. Import de designs

Une fois connecté, l'utilisateur peut :
1. Voir tous ses designs Canva dans une grille
2. Cliquer sur "Face" ou "Verso" pour importer un design
3. Le design est automatiquement exporté en PNG et appliqué

## ✨ Nouvelles fonctionnalités ajoutées

### Section Import Canva

```html
<!-- Une nouvelle section s'affiche dans generator.html -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
  <h2>🎨 Import depuis Canva</h2>
  <!-- Grille de designs avec boutons Face/Verso -->
</div>
```

### API JavaScript disponible

Le module `CanvaDesigns` est maintenant disponible globalement :

```javascript
// Vérifier si l'utilisateur est connecté
CanvaDesigns.isConnected(); // true/false

// Récupérer les designs
await CanvaDesigns.fetchDesigns({ limit: 20 });

// Exporter un design
await CanvaDesigns.exportDesign(designId, 'png');

// Rafraîchir l'affichage
CanvaDesigns.refresh();

// Mettre à jour le statut de connexion
CanvaDesigns.updateStatus();
```

### Événements personnalisés

L'intégration émet un événement lorsqu'un design est importé :

```javascript
document.addEventListener('canva:design-imported', (event) => {
  const { imageUrl, action, designId } = event.detail;
  console.log('Design importé:', imageUrl);
  // action = 'front' ou 'back'
});
```

## 🔧 Modifications effectuées

### Dans le fichier generator.html :

1. ✅ **Ajout du script** `canva-designs-fetcher.js` dans le `<head>`
2. ✅ **Ajout des styles CSS** pour la grille de designs Canva
3. ✅ **Ajout de la section HTML** pour afficher les designs
4. ✅ **Ajout du script d'intégration** pour gérer les événements et l'import automatique

### Styles CSS ajoutés :

- Grille responsive pour afficher les designs
- Cartes de design avec hover effects
- Prévisualisation des thumbnails
- Boutons d'import stylisés
- Indicateurs de chargement animés
- Scrollbar personnalisée

### Code JavaScript ajouté :

- Listener pour l'événement `canva:design-imported`
- Mapping automatique vers les champs Face/Verso
- Indicateurs de chargement pendant l'export
- Gestion de l'état de connexion
- Messages d'aide contextuelle

## 🐛 Dépannage

### Les designs ne s'affichent pas

1. Vérifiez la console JavaScript (F12)
2. Assurez-vous que vous êtes connecté : `CanvaDesigns.isConnected()`
3. Vérifiez le token : `localStorage.getItem('canva_access_token')`
4. Testez manuellement : `CanvaDesigns.fetchDesigns().then(console.log)`

### Erreur lors de l'export

```javascript
// Tester l'export manuellement
CanvaDesigns.exportDesign('DESIGN_ID_HERE', 'png')
  .then(urls => console.log('URLs:', urls))
  .catch(err => console.error('Erreur:', err));
```

### Le token est expiré

Le système gère automatiquement le refresh du token via le Worker Cloudflare.

Si vous voyez "Session Canva expirée", reconnectez-vous.

### CORS errors

Les URLs d'export Canva ont des politiques CORS strictes. L'intégration utilise :
- `crossOrigin = 'anonymous'` sur les images
- Mapping automatique vers vos champs existants
- Pas de manipulation côté client des pixels

## 📚 Documentation de référence

- [Canva Connect API Documentation](https://www.canva.dev/docs/connect/)
- [OAuth 2.0 PKCE Flow](https://oauth.net/2/pkce/)

## 🎨 Personnalisation

### Modifier le nombre de designs affichés

Dans `canva-designs-fetcher.js`, ligne ~267 :

```javascript
const response = await fetchDesigns({ limit: 20 }); // Changez la limite ici
```

### Modifier l'apparence des cartes

Éditez les classes CSS dans la section `<style>` de generator.html :

```css
.canva-design-item {
  /* Personnalisez ici */
}
```

### Ajouter des boutons supplémentaires

Dans `canva-designs-fetcher.js`, fonction `renderDesigns()`, ajoutez vos boutons :

```javascript
<button class="btn-custom" data-design-id="${design.id}">
  Mon action
</button>
```

## ⚠️ Points importants

### 1. URLs temporaires

Les URLs d'export Canva expirent après quelques heures. Ne les stockez pas à long terme.

### 2. Rate limiting

L'API Canva a des limites de taux. Pour un usage intensif, implémentez un cache.

### 3. Multi-pages

Les designs multi-pages exportent seulement la première page. Pour gérer les pages multiples, consultez la documentation Canva API.

### 4. Formats supportés

- ✅ PNG (recommandé pour la qualité)
- ✅ JPG
- ✅ PDF

## 🚀 Améliorations futures possibles

- [ ] Pagination pour charger plus de designs
- [ ] Recherche/filtrage par nom de design
- [ ] Tri par date de création/modification
- [ ] Prévisualisation en modal avec plus d'infos
- [ ] Sélection de la page pour les designs multi-pages
- [ ] Cache des designs récents
- [ ] Upload direct vers votre serveur
- [ ] Édition de base (crop, rotate) avant import

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez la console JavaScript (F12)
2. Vérifiez les logs dans le Network tab
3. Testez l'API manuellement avec les méthodes `CanvaDesigns.*`
4. Vérifiez la configuration du Worker Cloudflare

---

**Version**: 1.0.0  
**Dernière mise à jour**: Octobre 2024  
**Compatibilité**: Chrome, Firefox, Safari, Edge (dernières versions)

🎉 **Bonne utilisation !**
