// ═══════════════════════════════════════════════════════════════
// GALLERY LOADER - VERSION OPTIMISÉE AVEC DEBUGGING
// ═══════════════════════════════════════════════════════════════
// Utilise un cache-buster et logs détaillés pour debugging
// Compatible avec gallery.json contenant backgrounds et fullcovers
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    console.log('%c🎨 Gallery Loader v2.0 - Initialized', 'background: #10b981; color: white; padding: 5px; font-weight: bold;');
    
    // Configuration
    const CONFIG = {
        galleryUrl: '/gallery.json',
        cacheBuster: true,  // Active le cache-busting
        debug: true,        // Active les logs détaillés
        retryAttempts: 2,   // Nombre de tentatives en cas d'échec
        retryDelay: 1000    // Délai entre les tentatives (ms)
    };
    
    // État global
    let galleryData = null;
    let loadingPromise = null;
    
    // ═══════════════════════════════════════════════════════════
    // UTILITAIRES DE LOGGING
    // ═══════════════════════════════════════════════════════════
    
    function log(message, data = null) {
        if (!CONFIG.debug) return;
        if (data) {
            console.log(`📦 [Gallery] ${message}`, data);
        } else {
            console.log(`📦 [Gallery] ${message}`);
        }
    }
    
    function logError(message, error = null) {
        if (error) {
            console.error(`❌ [Gallery] ${message}`, error);
        } else {
            console.error(`❌ [Gallery] ${message}`);
        }
    }
    
    function logSuccess(message, data = null) {
        if (!CONFIG.debug) return;
        if (data) {
            console.log(`✅ [Gallery] ${message}`, data);
        } else {
            console.log(`✅ [Gallery] ${message}`);
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // CHARGEMENT DU GALLERY.JSON
    // ═══════════════════════════════════════════════════════════
    
    async function loadGalleryData(attempt = 1) {
        const url = CONFIG.cacheBuster 
            ? `${CONFIG.galleryUrl}?v=${Date.now()}`
            : CONFIG.galleryUrl;
            
        log(`Tentative ${attempt}/${CONFIG.retryAttempts + 1} - Chargement: ${url}`);
        console.time('gallery.json-load');
        
        try {
            const response = await fetch(url);
            
            // Vérifier le statut
            log(`Status: ${response.status} ${response.statusText}`);
            log(`Content-Type: ${response.headers.get('content-type')}`);
            log(`Server: ${response.headers.get('server')}`);
            log(`Cache-Control: ${response.headers.get('cache-control')}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parser le JSON
            const data = await response.json();
            console.timeEnd('gallery.json-load');
            
            // Valider la structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid JSON structure: not an object');
            }
            
            // Analyser le contenu
            const keys = Object.keys(data);
            logSuccess('JSON chargé et parsé avec succès');
            log('Clés disponibles:', keys);
            
            if (data.backgrounds) {
                log(`Backgrounds: ${data.backgrounds.length} items`);
                log('Premier background:', data.backgrounds[0]);
                
                // Vérifier les domaines utilisés
                const sampleUrls = data.backgrounds.slice(0, 10).map(item => item.url || item);
                const domains = [...new Set(sampleUrls.map(url => {
                    try { return new URL(url).hostname; }
                    catch { return 'invalid-url'; }
                }))];
                log('Domaines détectés:', domains);
                
                // Alerter si ancien domaine détecté
                if (domains.some(d => d.includes('images.gabaritkdp.com') || d.includes('r2.dev'))) {
                    logError('⚠️ ATTENTION: Ancien domaine détecté dans les URLs!');
                    logError('Le gallery.json doit être redéployé avec les URLs corrigées');
                }
            }
            
            if (data.fullcovers) {
                log(`Fullcovers: ${data.fullcovers.length} items`);
            }
            
            galleryData = data;
            return data;
            
        } catch (error) {
            console.timeEnd('gallery.json-load');
            logError(`Tentative ${attempt} échouée:`, error);
            
            // Retry si nécessaire
            if (attempt <= CONFIG.retryAttempts) {
                log(`Nouvelle tentative dans ${CONFIG.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
                return loadGalleryData(attempt + 1);
            }
            
            throw error;
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // FILTRAGE PAR CATÉGORIE
    // ═══════════════════════════════════════════════════════════
    
    function filterByCategory(items, category, type = 'path') {
        if (!items || !Array.isArray(items)) {
            logError('filterByCategory: items n\'est pas un tableau', items);
            return [];
        }
        
        log(`Filtrage: ${items.length} items pour catégorie "${category}" (type: ${type})`);
        
        const filtered = items.filter(item => {
            const url = item.url || item;
            
            if (type === 'path') {
                // Matcher par chemin dans l'URL
                // Exemple: "ANIMAUX/Loups" ou "ANIMAUX/Loups/Loups" (double dossier)
                const match = url.includes(category);
                return match;
            } else if (type === 'exact') {
                // Matcher exact (case-sensitive)
                return url.includes(`/${category}/`);
            } else if (type === 'slug') {
                // Matcher par slug (normalisé, insensible à la casse)
                const normalizedUrl = url.toLowerCase();
                const normalizedCategory = category.toLowerCase();
                return normalizedUrl.includes(normalizedCategory);
            }
            
            return false;
        });
        
        logSuccess(`${filtered.length} items trouvés pour "${category}"`);
        
        if (filtered.length === 0) {
            logError(`Aucun résultat pour "${category}"`);
            log('Suggestion: Vérifier le nom de la catégorie dans le JSON');
            log('Exemples d\'URLs dans le JSON:', items.slice(0, 3).map(i => i.url || i));
        } else {
            log('Exemples filtrés:', filtered.slice(0, 2));
        }
        
        return filtered;
    }
    
    // ═══════════════════════════════════════════════════════════
    // RENDU DANS UN CONTAINER
    // ═══════════════════════════════════════════════════════════
    
    function renderGallery(container, items, options = {}) {
        if (!container) {
            logError('renderGallery: container introuvable');
            return;
        }
        
        if (!items || items.length === 0) {
            log('Aucun item à afficher - affichage placeholder');
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: #f3f4f6; border-radius: 12px;">
                    <div style="font-size: 4rem; opacity: 0.3; margin-bottom: 20px;">🖼️</div>
                    <h3 style="color: #6b7280; margin: 0 0 10px 0; font-size: 1.5rem;">Aucune image trouvée</h3>
                    <p style="color: #9ca3af; margin: 0;">Cette catégorie ne contient pas encore d'images.</p>
                </div>
            `;
            return;
        }
        
        log(`Rendu de ${items.length} items dans`, container);
        
        const columns = options.columns || 3;
        const gap = options.gap || '20px';
        const placeholder = options.placeholder || 'https://via.placeholder.com/400x600?text=GabaritKDP';
        
        // Créer la grille
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(auto-fill, minmax(250px, 1fr))`;
        container.style.gap = gap;
        container.innerHTML = '';
        
        // Ajouter chaque item
        items.forEach((item, index) => {
            const url = item.url || item;
            const title = item.title || `Image ${index + 1}`;
            
            const card = document.createElement('div');
            card.className = 'gallery-item';
            card.style.cssText = `
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
            `;
            
            card.innerHTML = `
                <img 
                    src="${url}" 
                    alt="${title}"
                    loading="lazy"
                    onerror="this.src='${placeholder}'; this.style.opacity='0.5';"
                    style="width: 100%; height: 300px; object-fit: cover; display: block;"
                />
                <div style="padding: 15px;">
                    <h4 style="margin: 0; font-size: 0.9rem; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</h4>
                </div>
            `;
            
            // Hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            });
            
            // Click handler
            card.addEventListener('click', () => {
                if (options.onClick) {
                    options.onClick(item, index);
                } else {
                    log('Image cliquée:', url);
                    window.open(url, '_blank');
                }
            });
            
            container.appendChild(card);
        });
        
        logSuccess(`${items.length} items rendus avec succès`);
    }
    
    // ═══════════════════════════════════════════════════════════
    // API PUBLIQUE
    // ═══════════════════════════════════════════════════════════
    
    window.GalleryLoader = {
        // Charger les données
        async load() {
            if (galleryData) {
                log('Données déjà en cache');
                return galleryData;
            }
            
            if (loadingPromise) {
                log('Chargement déjà en cours...');
                return loadingPromise;
            }
            
            loadingPromise = loadGalleryData();
            return loadingPromise;
        },
        
        // Obtenir les données (sans charger)
        getData() {
            return galleryData;
        },
        
        // Filtrer par catégorie
        filter(category, type = 'backgrounds', filterType = 'path') {
            if (!galleryData) {
                logError('Données non chargées. Appelez load() d\'abord.');
                return [];
            }
            
            const items = galleryData[type] || [];
            return filterByCategory(items, category, filterType);
        },
        
        // Rendre dans un container
        render(containerSelector, items, options = {}) {
            const container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;
                
            renderGallery(container, items, options);
        },
        
        // Tout-en-un: charger, filtrer, rendre
        async loadAndRender(containerSelector, category, type = 'backgrounds', options = {}) {
            try {
                log('=== DÉBUT loadAndRender ===');
                
                // 1. Charger les données
                await this.load();
                
                // 2. Filtrer
                const items = this.filter(category, type, options.filterType || 'path');
                
                // 3. Rendre
                this.render(containerSelector, items, options);
                
                logSuccess('=== FIN loadAndRender ===');
                return items;
                
            } catch (error) {
                logError('loadAndRender failed:', error);
                
                const container = typeof containerSelector === 'string'
                    ? document.querySelector(containerSelector)
                    : containerSelector;
                    
                if (container) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 60px 20px; background: #fee2e2; border-radius: 12px; border: 2px solid #dc2626;">
                            <div style="font-size: 4rem; opacity: 0.5; margin-bottom: 20px;">⚠️</div>
                            <h3 style="color: #dc2626; margin: 0 0 10px 0;">Erreur de chargement</h3>
                            <p style="color: #991b1b; margin: 0;">${error.message}</p>
                            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                Recharger la page
                            </button>
                        </div>
                    `;
                }
                
                throw error;
            }
        },
        
        // Configuration
        setConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            log('Configuration mise à jour:', CONFIG);
        }
    };
    
    logSuccess('Gallery Loader prêt! Utilisez window.GalleryLoader');
    
})();
