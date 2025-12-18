# ⚡ Guide de Démarrage Rapide - Intégration Canva

## 🚀 Installation en 3 minutes

### Étape 1 : Télécharger les fichiers (30 secondes)

Vous avez déjà tous les fichiers nécessaires :

```
✅ generator-with-canva.html  (votre nouveau générateur)
✅ canva-designs-fetcher.js    (script Canva)
✅ callback.html               (page OAuth)
```

### Étape 2 : Remplacer votre fichier actuel (1 minute)

1. **Sauvegardez** votre `generator.html` actuel
2. **Renommez** `generator-with-canva.html` en `generator.html`
3. **Placez** `canva-designs-fetcher.js` dans le même dossier
4. **Placez** `callback.html` dans le dossier `/auth/` (ou adaptez le chemin)

Votre structure de fichiers :

```
votre-site/
├── generator.html              ← Nouveau fichier
├── canva-designs-fetcher.js    ← Ajouter
├── auth/
│   └── callback.html           ← Ajouter
└── logo-gabarit-kdp-site-web.png
```

### Étape 3 : Vérifier la configuration (1 minute)

Ouvrez `generator.html` et vérifiez ces 2 paramètres :

#### A. CLIENT_ID (ligne ~34)

```javascript
const CANVA_CONFIG = {
  CLIENT_ID: 'OC-AZnaRLvMwpXk',  // ← Vérifiez que c'est votre CLIENT ID
  // ...
};
```

#### B. CALLBACK_PATH (ligne ~36)

```javascript
CALLBACK_PATH: '/auth/callback.html',  // ← Vérifiez le chemin
```

Si votre callback.html est à la racine, changez en :

```javascript
CALLBACK_PATH: '/callback.html',
```

### Étape 4 : Vérifier le Worker URL

Ouvrez `callback.html` et vérifiez (ligne ~21) :

```javascript
const CONFIG = {
  WORKER_URL: 'https://canva-token.amzkdptessa.workers.dev',  // ← Votre Worker
  // ...
};
```

---

## ✅ C'est terminé !

### Testez maintenant :

1. **Ouvrez** generator.html dans votre navigateur
2. **Cherchez** la section "🎨 Import depuis Canva"
3. **Cliquez** sur "Se connecter à Canva"
4. **Autorisez** l'accès à vos designs
5. **Cliquez** sur un design → "Face" ou "Verso"

---

## 🎯 Ce que vous voyez maintenant

### Nouvelle section dans votre interface :

```
┌─────────────────────────────────────────┐
│ 🎨 Import depuis Canva     [🔄 Actualiser] │
├─────────────────────────────────────────┤
│ ✓ Connecté à Canva                      │
├─────────────────────────────────────────┤
│ [Design 1]  [Design 2]  [Design 3]      │
│ [📱 Face]   [📱 Face]   [📱 Face]        │
│ [🔄 Verso]  [🔄 Verso]  [🔄 Verso]       │
└─────────────────────────────────────────┘
```

---

## 🐛 Problème ? Dépannage rapide

### La section Canva n'apparaît pas

**Solution :**
1. Ouvrez la console (F12)
2. Cherchez les erreurs en rouge
3. Vérifiez que `canva-designs-fetcher.js` est bien chargé

### Les designs ne s'affichent pas

**Testez dans la console :**

```javascript
// Vérifier la connexion
CanvaDesigns.isConnected()  // Doit retourner true

// Vérifier le token
localStorage.getItem('canva_access_token')  // Ne doit pas être null

// Charger manuellement les designs
CanvaDesigns.refresh()
```

### Erreur "Session expirée"

**Solution :** Reconnectez-vous simplement
- Cliquez sur "Se connecter à Canva"
- Autorisez à nouveau

### L'import ne fonctionne pas

**Vérifiez dans la console :**

```javascript
// Vérifier que les fonctions de mapping existent
typeof window.__kdp_canva_onSelected  // Doit être "function"
typeof window.__kdp_setCanvaFront     // Doit être "function"
typeof window.__kdp_setCanvaBack      // Doit être "function"
```

---

## 💡 Trucs et astuces

### Raccourcis clavier

- `F12` - Ouvrir la console de développement
- `Ctrl + Shift + R` - Rafraîchir sans cache
- `Ctrl + F` - Rechercher dans le code

### Tests rapides

```javascript
// Tester la récupération des designs
await CanvaDesigns.fetchDesigns({ limit: 5 })

// Tester l'export d'un design
await CanvaDesigns.exportDesign('DESIGN_ID', 'png')

// Forcer la mise à jour du statut
CanvaDesigns.updateStatus()
```

### Voir les événements

```javascript
// Écouter tous les imports
document.addEventListener('canva:design-imported', (e) => {
  console.log('Design importé:', e.detail);
});
```

---

## 📱 Sur mobile/tablette

L'interface est **entièrement responsive** :

- **Mobile (<480px)** : 2 designs par ligne
- **Tablette (480-768px)** : 3 designs par ligne
- **Desktop (>768px)** : 4+ designs par ligne

---

## 🎨 Personnalisation rapide

### Modifier le nombre de designs affichés

Dans `canva-designs-fetcher.js`, ligne 267 :

```javascript
const response = await fetchDesigns({ limit: 20 });  // Changez ici
```

### Modifier la couleur des boutons

Dans `generator.html`, dans la section `<style>` :

```css
.btn-import-design {
  background: #3b82f6;  /* Bleu par défaut */
}

/* Pour la face (premier bouton) */
.btn-import-design[data-action="front"] {
  background: #10b981;  /* Vert */
}

/* Pour le verso (second bouton) */
.btn-import-design[data-action="back"] {
  background: #f59e0b;  /* Orange */
}
```

---

## 📚 Documentation complète

Pour aller plus loin, consultez :

- 📖 `README-INSTALLATION.md` - Guide complet d'installation
- 📝 `CHANGELOG-DETAILLE.md` - Liste détaillée des modifications
- 🌐 [Canva API Docs](https://www.canva.dev/docs/connect/)

---

## ⚡ Checklist finale

Avant de mettre en production :

- [ ] ✅ Les 3 fichiers sont en place
- [ ] ✅ Le CLIENT_ID est correct
- [ ] ✅ Le CALLBACK_PATH est correct
- [ ] ✅ Le WORKER_URL est correct
- [ ] ✅ Testé la connexion Canva
- [ ] ✅ Testé l'import d'un design
- [ ] ✅ Testé sur mobile
- [ ] ✅ Vérifié la console (pas d'erreurs)

---

## 🎉 Félicitations !

Votre générateur KDP est maintenant connecté à Canva !

Vos utilisateurs peuvent importer leurs designs Canva en **1 clic** 🚀

---

**Temps total d'installation** : ~3 minutes  
**Difficulté** : ⭐⭐☆☆☆ (Facile)  
**Support** : Consultez les fichiers de documentation

🚀 **Bonne utilisation !**
