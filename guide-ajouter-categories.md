# 📚 COMMENT AJOUTER D'AUTRES CATÉGORIES

## 🎯 TAGS DISPONIBLES DANS TON GALLERY.JSON

Voici **TOUS les tags** disponibles dans ton `gallery.json` (147 tags):

### 🐾 ANIMAUX
- `animaux` (général)
- `animaux cartoon`
- `loups` ⭐
- `feerique` ⭐
- `dinosaures`

### 💕 ROMANCE
- `romance` (général - **1,345 images!**)
- `dark romance` ⭐
- `paranormal romance` ⭐
- `romantic suspense` ⭐
- `romance contemporary chic & luxe`
- `romance black love`
- `romance fantasy`
- `romance urbaine paris villes`
- `romance small town`
- `romance au travail billionaire`
- `1930s mafia romance`

### 🚀 SCI-FI
- `sci fi` (général)
- `black futurism` ⭐
- `cyberpunk` ⭐
- `dystopia` ⭐
- `space opera black futurism`
- `sci fi — space opera`
- `cyberpunk — black futurism`

### 🕵️ THRILLER / MYSTERY
- `thriller` (général)
- `thriller – noir` ⭐
- `thriller – psychologique`
- `thriller – suspense`
- `crime` ⭐
- `murder mystery`
- `mystery`
- `cozy mystery`
- `whodunit`
- `detectives`

### ✨ FANTASY
- `fantasy` (général)
- `dark fantasy`
- `epic fantasy`
- `high fantasy`
- `magic fantasy`
- `urban fantasy`
- `witchcraft fantasy`
- `romantasy`

### 🏛️ HISTORICAL
- `historical`
- `medieval`
- `victorian`
- `regency`
- `colonial era`
- `highland historique old world`
- `1930s buildings & city`

### 😱 HORROR
- `horror`

### ✝️ RELIGIONS / SPIRITUALITÉ
- `religions` (général)
- `christianisme` ⭐
- `islam`
- `judaisme`
- `animisme`
- `vaudou`
- `spiritualite africaine`
- `magie africaine orishas`
- `magie creole`
- `kids worship cute`
- `style louange gospel`
- `bible journaling`
- `god in the nature`

### 🌍 VOYAGES
- `voyages` (général)
- `tokyo` ⭐
- `paris`
- `new york`
- `rome`
- `marrakech`
- `martinique`
- `république dominicaine`

### 🎨 STYLES ARTISTIQUES
- `art nouveau magique`
- `art nouveau bleu nuit & or`
- `style japonais — ukiyo e`
- `style klimt`
- `style picasso`
- `style pop art`
- `style renaissance`
- `van gogh style`
- `frida kahlo inspired art`
- `basquiat inspired`

### 🌸 THÈMES
- `fleurs`
- `paysages`
- `portraits`
- `visages`
- `textures`
- `boheme`
- `hippie`
- `vintage`
- `noel` / `noël`
- `mariage`
- `fêtes`
- `sunset`
- `ambiance`

### 📚 NON-FICTION
- `business`
- `entrepreneurship`
- `finance`
- `marketing`
- `self love workbook`
- `planners`
- `coloriages`

---

## 🛠️ COMMENT CRÉER UNE NOUVELLE PAGE

### Exemple: Tu veux créer "FANTASY → Dark Fantasy"

**1. Vérifie les tags disponibles:**
```
fantasy (général)
dark fantasy (spécifique)
```

**2. Décide du filtrage:**
- Si tu veux TOUTES les fantasy: `["fantasy"]`
- Si tu veux SEULEMENT dark fantasy: `["fantasy", "dark fantasy"]`

**3. Modifie le script dans la page:**
```javascript
const REQUIRED_TAGS = ["fantasy", "dark fantasy"];
```

---

## 📋 EXEMPLES DE NOUVELLES PAGES POSSIBLES

### 🌙 ROMANCE → Small Town
```javascript
const REQUIRED_TAGS = ["romance", "romance small town"];
```

### 💀 THRILLER → Psychologique
```javascript
const REQUIRED_TAGS = ["thriller", "thriller – psychologique"];
```

### 🏰 FANTASY → Medieval
```javascript
const REQUIRED_TAGS = ["fantasy", "medieval"];
```

### 🗾 VOYAGES → Tokyo
```javascript
const REQUIRED_TAGS = ["voyages", "tokyo"];
```

### 🎨 ART → Art Nouveau
```javascript
const REQUIRED_TAGS = ["art nouveau magique"];
```

### 📖 RELIGIONS → Islam
```javascript
const REQUIRED_TAGS = ["religions", "islam"];
```

---

## 🚀 ASTUCE PRO

### Pour voir combien d'images existent pour un combo:

```javascript
// Ouvre la console du site (F12)
// Colle ce code:

fetch('/gallery.json').then(r=>r.json()).then(data => {
  const all = [...data.fullcovers, ...data.backgrounds, ...data.ecovers||[]];
  const tags = ["romance", "dark romance"]; // ⬅️ Change ici
  const filtered = all.filter(item => 
    tags.every(tag => item.tags.some(t => 
      t.toLowerCase().includes(tag.toLowerCase())
    ))
  );
  console.log(`✅ ${filtered.length} images trouvées pour:`, tags);
});
```

---

## ⚠️ RÈGLES IMPORTANTES

1. **Les tags sont case-insensitive** (majuscules = minuscules)
2. **Les accents sont normalisés** (feerique = féerique)
3. **Le tiret compte!** `"thriller – noir"` ≠ `"thriller noir"`
4. **Espace vs tiret:** `"sci fi"` ≠ `"sci-fi"`

---

## 🎯 STRATÉGIE RECOMMANDÉE

### Pages "Larges" (Beaucoup d'images):
```javascript
["romance"]              // ➜ 1,345 images
["sci fi"]               // ➜ 340 images
["thriller"]             // ➜ ~100 images
```

### Pages "Spécifiques" (Peu d'images mais ciblées):
```javascript
["romance", "dark romance"]           // ➜ 91 images
["thriller", "thriller – noir"]       // ➜ 16 images
["sci fi", "cyberpunk"]               // ➜ 28 images
```

---

**Tu as maintenant tout ce qu'il faut pour créer TOUTES les pages que tu veux! 🎉**
