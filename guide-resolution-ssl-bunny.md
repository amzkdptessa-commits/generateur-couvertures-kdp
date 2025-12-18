# 🔧 GUIDE DE RÉSOLUTION - Problème SSL Bunny CDN

## 🎯 PROBLÈME IDENTIFIÉ

**Erreur** : `ERR_CERT_COMMON_NAME_INVALID`

**Cause** : Conflit de certificats entre :
- `images.gabaritkdp.com` → pointant vers Storage Zone (gabaritkdp-images.b-cdn.net)
- `images.gabaritkdp.com` → déclaré aussi dans la Pull Zone

Le navigateur reçoit le mauvais certificat selon l'URL appelée.

---

## ✅ SOLUTION EN 5 ÉTAPES

### ÉTAPE 1 : CORRIGER LES FICHIERS LOCALEMENT

1. **Télécharge** le script `fix-bunny-cdn-urls.ps1`
2. **Place-le** dans ton dossier : 
   ```
   C:\Users\tessa\OneDrive\Documents\SITE KDP COMPLET\generateur-de-couvertures-kdp\
   ```
3. **Exécute** dans PowerShell :
   ```powershell
   .\fix-bunny-cdn-urls.ps1
   ```

Le script va automatiquement :
- ✅ Corriger `gallery.json`
- ✅ Corriger tous les fichiers `.html`
- ✅ Remplacer toutes les URLs par `https://cdn.gabaritkdp.com`

---

### ÉTAPE 2 : CONFIGURER BUNNY CDN

1. **Connexion** : https://panel.bunny.net
2. **Pull Zone** : Clique sur `gabaritkdp`
3. **Onglet "Hostnames"**
4. **SUPPRIME** `images.gabaritkdp.com` de la liste
5. **Garde uniquement** :
   - ✅ `gabaritkdp.b-cdn.net` (Main, SSL Enabled)
   - ✅ `cdn.gabaritkdp.com` (SSL Enabled)

---

### ÉTAPE 3 : PURGER LE CACHE BUNNY

1. Dans la **Pull Zone** `gabaritkdp`
2. Clique sur **"Purge"** (menu en haut)
3. Sélectionne **"Purge All Files"**
4. **Confirme**
5. Attends **2-3 minutes**

---

### ÉTAPE 4 : TESTER EN LOCAL

```powershell
# Lance le serveur local
python -m http.server 8000
```

Ouvre : http://localhost:8000/marketplace.html

**Vérifie** :
- ✅ Les images se chargent
- ✅ Pas d'erreur SSL dans la console (F12)

---

### ÉTAPE 5 : DÉPLOYER SUR NETLIFY

```powershell
# Ajoute les modifications
git add .

# Commit
git commit -m "Fix: Uniformise toutes les URLs vers cdn.gabaritkdp.com"

# Push
git push
```

Attends **2-3 minutes** pour le déploiement Netlify.

---

## 🧪 VÉRIFICATIONS FINALES

### Test 1 : Image directe
```powershell
curl -I https://cdn.gabaritkdp.com/backgrounds/ANIMAUX/Loups/Wolves%20(1).png
```
✅ Doit retourner : `HTTP/2 200`

### Test 2 : Site en production
Ouvre : https://gabaritkdp.com/marketplace.html

**Vérifie dans F12 → Console** :
- ✅ Aucune erreur `ERR_CERT_COMMON_NAME_INVALID`
- ✅ Les images se chargent

### Test 3 : SSL Checker
https://www.sslshopper.com/ssl-checker.html
Entre : `cdn.gabaritkdp.com`
✅ Doit être valide

---

## 🆘 SI ÇA NE MARCHE TOUJOURS PAS

### Problème : Les images ne se chargent toujours pas

**Solution 1** : Vide le cache navigateur
```
Ctrl + Shift + Delete
→ Cache et cookies
→ Tout supprimer
```

**Solution 2** : Vérifier le DNS
```powershell
nslookup cdn.gabaritkdp.com
```
Doit retourner : `gabaritkdp.b-cdn.net`

**Solution 3** : Attendre la propagation
- DNS : 5-30 minutes
- Certificat SSL : 15 minutes max
- Cache Bunny : 2-5 minutes

---

## 📊 ARCHITECTURE FINALE

```
┌─────────────────────────────────────────────┐
│ gabaritkdp.com                              │
│ (Netlify - Proxied via Cloudflare)         │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTML pages load images from:
                   ▼
┌─────────────────────────────────────────────┐
│ cdn.gabaritkdp.com                          │
│ (CNAME → gabaritkdp.b-cdn.net)              │
│ (DNS Only - pas de proxy Cloudflare)       │
└──────────────────┬──────────────────────────┘
                   │
                   │ Pull Zone forwards to:
                   ▼
┌─────────────────────────────────────────────┐
│ Storage Zone: gabaritkdp-images             │
│ Bunny.net - 7,395 fichiers                  │
└─────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST FINALE

Avant de dire "c'est fini", vérifie :

- [ ] Le script `fix-bunny-cdn-urls.ps1` a été exécuté
- [ ] `images.gabaritkdp.com` est supprimé de la Pull Zone Bunny
- [ ] Le cache Bunny a été purgé
- [ ] Le site fonctionne en local (localhost:8000)
- [ ] Les changements sont committés sur Git
- [ ] Le site est déployé sur Netlify
- [ ] Les images se chargent sur le site de production
- [ ] Aucune erreur dans la console F12

---

## 💡 POURQUOI CETTE SOLUTION ?

**Option A (choisie)** : Un seul hostname `cdn.gabaritkdp.com`
- ✅ Plus simple
- ✅ Un seul certificat SSL
- ✅ Pas de conflit
- ✅ Performance optimale via Pull Zone

**Option B (non utilisée)** : Séparer `cdn` et `images`
- ❌ Complexe
- ❌ 2 certificats à gérer
- ❌ Risque de conflit
- ❌ Pas nécessaire pour ton cas d'usage

---

## 📞 SUPPORT

Si tu as encore des problèmes après avoir suivi ce guide :

1. **Vérifie les logs Bunny** : Panel → Pull Zone → Statistics
2. **Vérifie les logs Netlify** : Deploys → Logs
3. **Teste en navigation privée** : Ctrl+Shift+N

---

🎉 **Bonne chance !**
