# 🎨 Guide d'intégration - Import des designs Canva

## 📋 Vue d'ensemble

Ce guide explique comment intégrer la fonctionnalité d'import des designs Canva dans votre générateur KDP.

---

## 📁 Fichiers à ajouter

### 1. Télécharger le fichier JavaScript

Copiez le fichier `canva-designs-fetcher.js` dans le même dossier que `generator.html`.

---

## 🔧 Modifications dans generator.html

### Étape 1 : Ajouter le script dans le `<head>`

Ajoutez cette ligne **APRÈS** l'inclusion de `canva-integration.js` :

```html
<script src="canva-designs-fetcher.js" defer></script>
```

### Étape 2 : Ajouter le HTML pour afficher les designs

Cherchez la section "Import from Canva" dans votre `generator.html` (vers la ligne 1200-1300) et remplacez-la par :

```html
<!-- Section Import Canva -->
<div class="bg-white rounded-lg shadow-md p-6 mb-6">
  <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
    🎨 <span data-lang="canvaImport">Import depuis Canva</span>
  </h2>
  
  <!-- Statut de connexion -->
  <div id="canva-connection-status" class="mb-4">
    <!-- Sera rempli par JavaScript -->
  </div>
  
  <!-- Loading indicator -->
  <div id="canva-loading" class="hidden text-center py-4">
    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <p class="mt-2 text-gray-600">Chargement de vos designs...</p>
  </div>
  
  <!-- Grille de designs -->
  <div id="canva-designs-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
    <!-- Les designs seront affichés ici -->
  </div>
</div>
```

### Étape 3 : Ajouter les styles CSS

Ajoutez ces styles dans la section `<style>` de votre `generator.html` :

```css
/* Styles pour la grille de designs Canva */
.canva-design-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.canva-design-item {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.canva-design-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.canva-design-item.selected {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.canva-design-preview {
  width: 100%;
  height: 150px;
  background: #f3f4f6;
  border-radius: 0.375rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canva-design-info {
  margin-top: 0.75rem;
}

.canva-design-title {
  font-weight: 600;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canva-design-size {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}
```

---

## 🎯 Utilisation dans votre code React

Dans votre composant React (dans generator.html), ajoutez un listener pour l'événement `canva:design-imported` :

```javascript
// Dans votre useEffect ou componentDidMount
useEffect(() => {
  // Écouter l'événement d'import de design
  const handleDesignImported = (event) => {
    const { imageUrl, action, designId } = event.detail;
    
    console.log('Design importé:', { imageUrl, action, designId });
    
    // Créer une image depuis l'URL
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (action === 'front') {
        setFrontImage(img);
        // Ou: handleImageUpload(img, 'front')
      } else if (action === 'back') {
        setBackImage(img);
        // Ou: handleImageUpload(img, 'back')
      }
    };
    img.src = imageUrl;
  };

  document.addEventListener('canva:design-imported', handleDesignImported);
  
  return () => {
    document.removeEventListener('canva:design-imported', handleDesignImported);
  };
}, []);
```

---

## 📡 API disponible

Le module expose l'objet global `window.CanvaDesigns` avec ces méthodes :

### `CanvaDesigns.isConnected()`
Retourne `true` si l'utilisateur est connecté à Canva.

```javascript
if (CanvaDesigns.isConnected()) {
  console.log('Utilisateur connecté !');
}
```

### `CanvaDesigns.fetchDesigns(options)`
Récupère les designs de l'utilisateur.

```javascript
const designs = await CanvaDesigns.fetchDesigns({ limit: 20 });
console.log('Designs:', designs.items);
```

### `CanvaDesigns.exportDesign(designId, format)`
Exporte un design au format spécifié.

```javascript
const urls = await CanvaDesigns.exportDesign('DABnAbC123', 'png');
console.log('URLs d\'export:', urls);
```

### `CanvaDesigns.refresh()`
Recharge et affiche les designs.

```javascript
CanvaDesigns.refresh();
```

### `CanvaDesigns.updateStatus()`
Met à jour le statut de connexion dans l'UI.

```javascript
CanvaDesigns.updateStatus();
```

---

## 🔄 Flow complet

1. **L'utilisateur se connecte** via OAuth (déjà fonctionnel)
2. **Le module détecte** automatiquement la connexion
3. **Les designs sont chargés** et affichés dans une grille
4. **L'utilisateur clique** sur "Face" ou "Verso" d'un design
5. **Le design est exporté** en PNG via l'API Canva
6. **L'événement est émis** → `canva:design-imported`
7. **Votre code React** reçoit l'image et l'applique

---

## 🐛 Debugging

### Vérifier la connexion
```javascript
console.log('Connected:', CanvaDesigns.isConnected());
console.log('Token:', localStorage.getItem('canva_access_token'));
```

### Tester manuellement l'API
```javascript
// Test user info
CanvaDesigns.fetchUserInfo().then(console.log);

// Test designs
CanvaDesigns.fetchDesigns({ limit: 5 }).then(console.log);

// Test export
CanvaDesigns.exportDesign('VOTRE_DESIGN_ID', 'png').then(console.log);
```

### Voir les événements
```javascript
document.addEventListener('canva:design-imported', (e) => {
  console.log('Design imported:', e.detail);
});
```

---

## ⚠️ Points importants

### 1. CORS et images Canva
Les URLs d'export Canva sont temporaires et ont une **politique CORS restrictive**. Vous devrez peut-être :

- Utiliser un proxy si vous voulez manipuler l'image côté client
- Ou télécharger l'image côté serveur puis la servir depuis votre domaine

### 2. Expiration des URLs d'export
Les URLs d'export expirent après **quelques heures**. Ne les stockez pas longtemps.

### 3. Rate limiting
L'API Canva a des limites de taux. Pour un usage intensif, ajoutez un système de cache.

### 4. Gestion du token expiré
Si le token expire, l'utilisateur devra se reconnecter. Le module détecte automatiquement cette situation.

---

## 🎨 Personnalisation de l'UI

Vous pouvez personnaliser l'apparence des cartes de design en modifiant la fonction `renderDesigns()` dans `canva-designs-fetcher.js`.

Exemple : Ajouter un bouton "Prévisualiser" :

```javascript
<button class="btn-preview-design text-xs px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        data-design-id="${design.id}">
  👁️ Voir
</button>
```

---

## 🚀 Prochaines étapes

1. ✅ Intégrer le fichier JavaScript
2. ✅ Ajouter le HTML dans generator.html
3. ✅ Ajouter les styles CSS
4. ✅ Connecter l'événement à votre code React
5. ✅ Tester avec un design Canva

---

## 💡 Améliorations possibles

- **Pagination** : Charger plus de designs au scroll
- **Recherche** : Filtrer les designs par nom
- **Tri** : Trier par date de création/modification
- **Prévisualisation** : Modal avec plus d'infos sur le design
- **Multi-pages** : Pour les designs multi-pages, choisir quelle page exporter
- **Cache** : Mettre en cache les designs pour éviter de recharger

---

Besoin d'aide ? Consultez la [documentation Canva Connect API](https://www.canva.dev/docs/connect/) 📚
