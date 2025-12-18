// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC COMPLET GALLERY.JSON - À EXÉCUTER DANS LA CONSOLE F12
// ═══════════════════════════════════════════════════════════════
// Copier/coller dans la console de Chrome/Firefox sur gabaritkdp.com
// ═══════════════════════════════════════════════════════════════

console.clear();
console.log('%c🔍 DIAGNOSTIC GALLERY.JSON - DÉBUT', 'background: #3b82f6; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

async function diagnosticComplet() {
    const results = {};
    
    // ═══ TEST 1: Vérifier l'existence et le statut ═══
    console.log('\n%c📡 TEST 1: Vérification du fichier', 'background: #10b981; color: white; padding: 5px; font-weight: bold;');
    try {
        const response = await fetch('/gallery.json?v=' + Date.now());
        results.status = response.status;
        results.contentType = response.headers.get('content-type');
        results.cacheControl = response.headers.get('cache-control');
        results.server = response.headers.get('server');
        results.size = response.headers.get('content-length');
        
        console.log('✅ Status:', results.status);
        console.log('✅ Content-Type:', results.contentType);
        console.log('✅ Cache-Control:', results.cacheControl);
        console.log('✅ Server:', results.server);
        console.log('✅ Taille:', results.size, 'bytes');
        
        if (results.status !== 200) {
            console.error('❌ ERREUR: Le fichier ne répond pas 200 OK');
            return results;
        }
    } catch (error) {
        console.error('❌ ERREUR FETCH:', error);
        results.fetchError = error.message;
        return results;
    }
    
    // ═══ TEST 2: Charger et parser le JSON ═══
    console.log('\n%c📦 TEST 2: Chargement et parsing JSON', 'background: #10b981; color: white; padding: 5px; font-weight: bold;');
    try {
        const response = await fetch('/gallery.json?v=' + Date.now());
        const data = await response.json();
        results.jsonValid = true;
        results.keys = Object.keys(data);
        
        console.log('✅ JSON valide');
        console.log('✅ Clés trouvées:', results.keys);
        
        // Analyser le contenu
        if (data.backgrounds) {
            results.backgroundsCount = data.backgrounds.length;
            console.log('✅ Nombre de backgrounds:', results.backgroundsCount);
            
            // Vérifier les 3 premiers backgrounds
            const firstThree = data.backgrounds.slice(0, 3);
            console.log('✅ Premiers backgrounds:', firstThree);
            
            // Vérifier les domaines utilisés
            const urls = data.backgrounds.map(item => item.url || item).slice(0, 100);
            const domains = [...new Set(urls.map(url => {
                try {
                    return new URL(url).hostname;
                } catch {
                    return 'invalid';
                }
            }))];
            
            results.domains = domains;
            console.log('✅ Domaines détectés:', domains);
            
            // Vérifier spécifiquement pour ANIMAUX/Loups
            const loupsImages = data.backgrounds.filter(item => {
                const url = item.url || item;
                return url.includes('ANIMAUX') && url.includes('Loups');
            });
            
            results.loupsCount = loupsImages.length;
            console.log('✅ Images ANIMAUX/Loups trouvées:', results.loupsCount);
            
            if (loupsImages.length > 0) {
                console.log('✅ Exemple image Loups:', loupsImages[0]);
            }
            
            // Vérifier les domaines problématiques
            const problemDomains = urls.filter(url => 
                url.includes('images.gabaritkdp.com') || 
                url.includes('r2.dev') ||
                url.includes('cloudflare')
            );
            
            if (problemDomains.length > 0) {
                console.warn('⚠️ ATTENTION: URLs problématiques détectées:', problemDomains.length);
                console.log('Exemples:', problemDomains.slice(0, 5));
                results.problemUrls = problemDomains.length;
            } else {
                console.log('✅ Aucune URL problématique détectée');
                results.problemUrls = 0;
            }
        }
        
        if (data.fullcovers) {
            results.fullcoversCount = data.fullcovers.length;
            console.log('✅ Nombre de fullcovers:', results.fullcoversCount);
        }
        
    } catch (error) {
        console.error('❌ ERREUR PARSING JSON:', error);
        results.jsonValid = false;
        results.jsonError = error.message;
        return results;
    }
    
    // ═══ TEST 3: Tester le chargement d'une image ═══
    console.log('\n%c🖼️ TEST 3: Test de chargement image', 'background: #10b981; color: white; padding: 5px; font-weight: bold;');
    try {
        const response = await fetch('/gallery.json?v=' + Date.now());
        const data = await response.json();
        
        if (data.backgrounds && data.backgrounds.length > 0) {
            const testUrl = data.backgrounds[0].url || data.backgrounds[0];
            console.log('🔗 Test URL:', testUrl);
            
            const imgTest = new Image();
            const loadPromise = new Promise((resolve, reject) => {
                imgTest.onload = () => resolve(true);
                imgTest.onerror = () => reject(new Error('Failed to load'));
                setTimeout(() => reject(new Error('Timeout')), 5000);
            });
            
            imgTest.src = testUrl;
            
            try {
                await loadPromise;
                console.log('✅ Image chargée avec succès!');
                console.log('✅ Dimensions:', imgTest.width, 'x', imgTest.height);
                results.imageLoadTest = 'success';
            } catch (error) {
                console.error('❌ Échec chargement image:', error.message);
                results.imageLoadTest = 'failed';
            }
        }
    } catch (error) {
        console.error('❌ ERREUR TEST IMAGE:', error);
        results.imageLoadTest = 'error';
    }
    
    // ═══ RÉSUMÉ FINAL ═══
    console.log('\n%c📊 RÉSUMÉ DU DIAGNOSTIC', 'background: #6366f1; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
    console.table(results);
    
    // ═══ RECOMMANDATIONS ═══
    console.log('\n%c💡 RECOMMANDATIONS', 'background: #f59e0b; color: white; padding: 10px; font-size: 14px; font-weight: bold;');
    
    if (results.problemUrls > 0) {
        console.log('🔴 ACTION REQUISE: Gallery.json contient des URLs avec ancien domaine!');
        console.log('   → Redéployer le gallery-FINAL-BON.json corrigé');
        console.log('   → Purger le cache Bunny CDN après redéploiement');
    } else if (results.domains && results.domains.includes('cdn.gabaritkdp.com')) {
        console.log('✅ Les URLs utilisent le bon domaine (cdn.gabaritkdp.com)');
        console.log('   → Si les images ne s affichent toujours pas, vérifier:');
        console.log('      1. Le code JavaScript qui charge les images');
        console.log('      2. Les filtres de catégorie (slug/path matching)');
        console.log('      3. La console pour d\'autres erreurs JS');
    } else {
        console.log('⚠️ Domaines détectés:', results.domains);
        console.log('   → Vérifier si c\'est bien cdn.gabaritkdp.com');
    }
    
    return results;
}

// Lancer le diagnostic
diagnosticComplet()
    .then(results => {
        console.log('\n%c✨ DIAGNOSTIC TERMINÉ', 'background: #10b981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
        console.log('Résultats stockés dans window.diagnosticResults');
        window.diagnosticResults = results;
    })
    .catch(error => {
        console.error('❌ ERREUR FATALE:', error);
    });
