# 🔥 KDP TRACKER - EXTENSION + BACKEND

Système complet pour tracker les ventes Amazon KDP en temps réel, comme Publisher Champ !

---

## 📦 CE QUI EST INCLUS

**Extension Chrome :**
- Capture les cookies Amazon KDP
- Interface utilisateur simple
- Sync automatique toutes les 10 min
- Notifications push pour nouvelles ventes

**Backend Node.js :**
- Scraping KDP avec cookies
- API REST
- Stockage Supabase
- Auto-sync

---

## 🚀 INSTALLATION RAPIDE

### **1. Extension Chrome**

```bash
cd kdp-tracker-extension

# Ouvrir Chrome
# Aller dans chrome://extensions/
# Activer "Mode développeur"
# Cliquer "Charger l'extension non empaquetée"
# Sélectionner le dossier kdp-tracker-extension
```

### **2. Backend**

```bash
cd kdp-tracker-backend

# Installer dépendances
npm install express cors axios cheerio @supabase/supabase-js dotenv

# Configurer .env
cp .env.example .env
# Éditer .env avec tes credentials Supabase

# Lancer le serveur
node server.js
```

### **3. Supabase**

```sql
-- Se connecter à Supabase Dashboard
-- SQL Editor → Nouveau query
-- Copier-coller tout le contenu de supabase-schema.sql
-- Exécuter
```

---

## ⚙️ CONFIGURATION

### **Backend .env**

```env
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbG...
```

### **Extension popup.js**

Ligne 2, change l'URL API :
```javascript
const API_URL = 'https://api.gabaritkdp.com'; // Ton domaine
```

---

## 📋 COMMENT ÇA MARCHE

### **Flow complet :**

1. **Utilisateur installe l'extension**
2. **Se connecte à KDP** → https://kdpreports.amazon.com/dashboard
3. **Ouvre l'extension** → Entre email/password GabaritKDP
4. **Clique "Synchroniser"**
5. **Extension capture cookies** Amazon
6. **Envoie au backend** via POST /api/sync-kdp
7. **Backend scrape KDP** avec ces cookies
8. **Parse les données** (ventes, royalties, KENP)
9. **Stocke en DB** Supabase
10. **Auto-sync** toutes les 10 min
11. **Notifications** si nouvelles ventes

---

## 🔧 SCRAPING KDP

### **Important : Adapter le parsing**

Le fichier `server.js` contient une fonction `extractSalesData()` qui DOIT être adaptée à la structure réelle de KDP.

**Pour trouver les bons sélecteurs :**

1. Ouvre KDP Reports dans Chrome
2. Ouvre DevTools (F12)
3. Inspect les éléments du tableau de ventes
4. Note les classes CSS :
   - `.book-title` (titre du livre)
   - `.units-sold` (unités vendues)
   - `.royalty` (royalties)
   - `.sale-date` (date)

5. Update dans `server.js` :

```javascript
function extractSalesData($) {
  const sales = [];
  
  // Adapter ces sélecteurs CSS !
  $('.sales-row').each((i, elem) => {
    const title = $(elem).find('.book-title').text().trim();
    const units = parseInt($(elem).find('.units-sold').text()) || 0;
    const royalty = parseFloat($(elem).find('.royalty').text().replace('$', '')) || 0;
    
    sales.push({ title, units, royalty });
  });
  
  return sales;
}
```

**Exemple réel (à vérifier sur KDP) :**

```javascript
// Si KDP utilise des tableaux
$('table tbody tr').each((i, row) => {
  const cells = $(row).find('td');
  const title = $(cells[0]).text().trim();
  const units = parseInt($(cells[3]).text()) || 0;
  const royalty = parseFloat($(cells[4]).text().replace('$', '')) || 0;
  
  sales.push({ title, units, royalty });
});
```

---

## 🎨 PERSONNALISER L'EXTENSION

### **Icônes**

Crée 3 icônes :
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

### **Couleurs**

Dans `popup.html`, change les couleurs :
```css
.logo {
  color: #FF9900; /* Ton orange */
}

.btn-primary {
  background: linear-gradient(135deg, #FF9900 0%, #FF6600 100%);
}
```

---

## 📊 API ENDPOINTS

### **POST /api/sync-kdp**
Première synchronisation

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "cookies": [...],
  "marketplace": "US"
}
```

**Response :**
```json
{
  "success": true,
  "userId": "uuid",
  "message": "Synchronisation réussie !"
}
```

### **POST /api/auto-sync**
Sync automatique (appelé par extension)

**Body :**
```json
{
  "userId": "uuid",
  "cookies": [...]
}
```

**Response :**
```json
{
  "success": true,
  "newSales": 3,
  "totalSales": 142,
  "totalRoyalties": 456.78
}
```

### **GET /api/sales/:userId**
Récupérer les ventes

**Response :**
```json
{
  "sales": [
    {
      "book_title": "Mon Livre",
      "units_sold": 5,
      "royalty": 12.50,
      "sale_date": "2025-12-03"
    }
  ]
}
```

---

## 🔒 SÉCURITÉ

### **Cookies**
- Stockés chiffrés en DB (JSONB)
- Jamais exposés côté client
- Row Level Security activé

### **Auth**
- Supabase Auth
- JWT tokens
- RLS sur toutes les tables

### **CORS**
Configure CORS en production :
```javascript
app.use(cors({
  origin: 'https://gabaritkdp.com',
  credentials: true
}));
```

---

## 🚨 TROUBLESHOOTING

### **Extension ne capture pas les cookies**
- Vérifier que l'utilisateur est sur kdpreports.amazon.com
- Vérifier que l'utilisateur est bien connecté à KDP
- Ouvrir console extension (chrome://extensions → Détails → Inspecter)

### **Scraping échoue**
- Amazon a peut-être changé son HTML
- Update les sélecteurs dans `extractSalesData()`
- Vérifier les cookies sont valides
- Vérifier le User-Agent

### **Cookies expirent trop vite**
- Normal : Amazon invalide après 24-48h
- Utilisateur doit "refresh" dans l'extension
- Implémenter refresh automatique si besoin

---

## 📈 AMÉLIORA (MORE THAN 500 CHARACTERS)

TIONS FUTURES

### **Phase 1 (maintenant)**
- ✅ Extension + Backend basique
- ✅ Scraping ventes
- ✅ Dashboard simple

### **Phase 2 (3 mois)**
- Scraping multi-marketplaces (UK, DE, FR, CA, AU)
- Parse KENP reads (Kindle Unlimited)
- Parse reviews & ratings
- Parse BSR

### **Phase 3 (6 mois)**
- Amazon Ads integration
- Graphiques avancés
- Export CSV
- Notifications configurables

### **Phase 4 (12 mois)**
- ACX (Audiobooks)
- Draft2Digital
- IngramSpark
- Kobo

---

## 💰 PRICING

**Suggestions :**
- Free : Jusqu'à €100/mois de royalties
- Pro : €9.99/mois (sync toutes les 10 min)
- Premium : €19.99/mois (sync toutes les 3 min + alerts)

---

## 📝 TODO LIST

- [ ] Tester avec vraie page KDP
- [ ] Adapter sélecteurs CSS
- [ ] Ajouter refresh cookie automatique
- [ ] Multi-marketplaces
- [ ] Parse KENP reads
- [ ] Dashboard avec graphiques
- [ ] Notifications configurables
- [ ] Export CSV
- [ ] Tests unitaires
- [ ] Deploy backend (Railway/Render)

---

## 🎯 RÉSUMÉ

**Tu as maintenant :**
1. ✅ Extension Chrome complète
2. ✅ Backend Node.js avec scraping
3. ✅ Schéma Supabase
4. ✅ Documentation complète

**Il reste à faire :**
1. Adapter les sélecteurs CSS pour KDP
2. Tester avec un vrai compte KDP
3. Deploy le backend
4. Publier l'extension Chrome Web Store

**Temps estimé : 2-3 jours de dev + tests**

---

**SIMPLE et DIRECT comme tu voulais ! 🔥**