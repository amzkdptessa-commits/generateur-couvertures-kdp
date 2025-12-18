/**
 * CANVA DESIGNS FETCHER v7 - VERSION SIMPLE QUI MARCHE
 */

(function() {
  'use strict';

  console.log('🚀 [CANVA] v7 - Version simple');

  const API_BASE = 'https://api.canva.com/rest/v1';
  let allDesigns = [];
  let currentSearch = '';
  let isLoading = false;

  window.CanvaDesigns = {
    
    isConnected() {
      const token = localStorage.getItem('canva_access_token');
      const expiry = parseInt(localStorage.getItem('canva_token_expiry') || '0', 10);
      return token && expiry && Date.now() < (expiry - 300000);
    },

    async fetchDesigns({ limit = 50, continuation = null } = {}) {
      if (!this.isConnected()) throw new Error('Non connecté');

      const token = localStorage.getItem('canva_access_token');
      let url = `${API_BASE}/designs?limit=${limit}`;
      if (continuation) url += `&continuation=${continuation}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);

      const data = await response.json();
      return {
        items: data.items || [],
        continuation: data.continuation || null
      };
    },

    async exportDesign(designId, format = 'png') {
      if (!this.isConnected()) throw new Error('Non connecté');

      const token = localStorage.getItem('canva_access_token');
      const requestBody = {
        design_id: designId,
        format: { type: format.toLowerCase() }
      };

      const createResponse = await fetch(`${API_BASE}/exports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Export error ${createResponse.status}`);
      }

      const responseData = await createResponse.json();
      const jobId = responseData?.job?.id;
      if (!jobId) throw new Error('No job ID');

      return await this.waitForExport(jobId, token);
    },

    async waitForExport(jobId, token, maxAttempts = 30) {
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${API_BASE}/exports/${jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        const status = data.job?.status;

        if (status === 'success') {
          const urls = 
            data.job?.result?.urls ||
            data.job?.urls ||
            data.result?.urls ||
            data.urls ||
            [];
          
          if (urls.length > 0) {
            return urls.map(item => item.url || item);
          }
        } else if (status === 'failed') {
          throw new Error('Export failed');
        }
      }
      throw new Error('Timeout');
    },

    async displayDesigns() {
      console.log('🎨 [CANVA] displayDesigns() - DÉBUT');
      
      const container = document.getElementById('canva-designs-container');
      console.log('📦 [CANVA] Container:', container);
      
      if (!container) {
        console.error('❌ [CANVA] Container introuvable!');
        return;
      }

      // 🔧 Toujours rendre le container visible
      container.style.display = 'block';
      console.log('✅ [CANVA] Container rendu visible');

      if (!this.isConnected()) {
        console.log('⚠️ [CANVA] Pas connecté - affichage message de connexion');
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; background: #f0f9ff; border: 2px dashed #3b82f6; border-radius: 12px; margin-top: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
            <h3 style="color: #1e40af; margin: 0 0 0.5rem 0;">Importez depuis Canva</h3>
            <p style="color: #64748b; margin: 0;">Connectez-vous pour accéder à vos designs</p>
          </div>
        `;
        return;
      }

      console.log('✅ [CANVA] Connecté - création interface');
      this.createSimpleInterface(container);
      await this.loadMoreDesigns();
    },

    createSimpleInterface(container) {
      console.log('🎨 [CANVA] createSimpleInterface() - DÉBUT');
      
      // 🔧 FIX: Rendre le container visible
      container.style.display = 'block';
      console.log('✅ [CANVA] Container maintenant visible:', container.style.display);
      
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <input 
              type="text" 
              id="canva-search-input" 
              placeholder="🔍 Rechercher dans vos designs..."
              style="width: 100%; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;"
            />
            <div id="canva-results-info" style="color: #64748b; font-size: 0.875rem; font-weight: 500;">
              Chargement...
            </div>
          </div>
          
          <div id="canva-designs-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; min-height: 200px;"></div>
          
          <div style="text-align: center;">
            <button 
              id="canva-load-more-btn" 
              style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: none;"
            >
              Charger plus de designs
            </button>
          </div>
        </div>
      `;

      console.log('✅ [CANVA] HTML injecté');

      // Events
      const searchInput = document.getElementById('canva-search-input');
      const loadMoreBtn = document.getElementById('canva-load-more-btn');

      console.log('🔍 [CANVA] Search input:', searchInput);
      console.log('🔘 [CANVA] Load more btn:', loadMoreBtn);

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.toLowerCase();
          this.filterAndDisplayDesigns();
        });
        console.log('✅ [CANVA] Search event OK');
      }

      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          this.loadMoreDesigns();
        });
        console.log('✅ [CANVA] Button event OK');
      }
    },

    async loadMoreDesigns() {
      if (isLoading) return;
      isLoading = true;

      console.log('📥 [CANVA] loadMoreDesigns()');

      const loadMoreBtn = document.getElementById('canva-load-more-btn');
      const infoDiv = document.getElementById('canva-results-info');

      if (loadMoreBtn) loadMoreBtn.disabled = true;
      if (infoDiv) infoDiv.textContent = '⏳ Chargement...';

      try {
        const lastContinuation = allDesigns.length > 0 ? 
          localStorage.getItem('canva_last_continuation') : null;

        const result = await this.fetchDesigns({ 
          limit: 50, 
          continuation: lastContinuation 
        });

        allDesigns = [...allDesigns, ...result.items];
        console.log('📊 [CANVA] Total designs:', allDesigns.length);

        if (result.continuation) {
          localStorage.setItem('canva_last_continuation', result.continuation);
          if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Charger plus de designs';
          }
        } else {
          // Fin atteinte - garder le bouton visible avec un message
          if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = '✅ Tous les designs chargés (' + allDesigns.length + ')';
            loadMoreBtn.style.opacity = '0.6';
          }
          localStorage.removeItem('canva_last_continuation');
        }

        this.filterAndDisplayDesigns();
      } catch (error) {
        console.error('❌ [CANVA] Error:', error);
        if (infoDiv) infoDiv.textContent = '❌ Erreur de chargement';
      }

      isLoading = false;
    },

    filterAndDisplayDesigns() {
      console.log('🔄 [CANVA] filterAndDisplayDesigns()');
      
      const grid = document.getElementById('canva-designs-grid');
      const infoDiv = document.getElementById('canva-results-info');
      
      if (!grid) {
        console.error('❌ [CANVA] Grid introuvable!');
        return;
      }

      console.log('✅ [CANVA] Grid OK');

      let filteredDesigns = allDesigns;
      if (currentSearch) {
        filteredDesigns = allDesigns.filter(d => 
          (d.title || '').toLowerCase().includes(currentSearch)
        );
      }

      if (infoDiv) {
        const total = allDesigns.length;
        const filtered = filteredDesigns.length;
        infoDiv.textContent = currentSearch 
          ? `📊 ${filtered}/${total} designs` 
          : `📊 ${total} designs`;
      }

      if (filteredDesigns.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem;"><h3>Aucun design</h3></div>';
      } else {
        console.log('✅ [CANVA] Affichage', filteredDesigns.length, 'designs');
        grid.innerHTML = filteredDesigns.map(d => this.createDesignCard(d)).join('');
        this.attachButtonEvents();
      }
    },

    createDesignCard(design) {
      const thumbnail = design.thumbnail?.url || '';
      const title = design.title || 'Sans titre';
      const width = design.width?.value || '?';
      const height = design.height?.value || '?';
      const unit = design.width?.unit || 'px';
      
      return `
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s;">
          <img src="${thumbnail}" alt="${title}" style="width: 100%; height: 180px; object-fit: cover; background: #f8f9fa;" loading="lazy">
          <div style="padding: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${title}">${title}</h4>
            <p style="margin: 0 0 1rem 0; font-size: 0.8rem; color: #6c757d;">📐 ${width} × ${height} ${unit}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <button 
                class="canva-btn" 
                data-action="front" 
                data-design-id="${design.id}"
                style="padding: 0.6rem; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.85rem; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
              >
                📱 Face
              </button>
              <button 
                class="canva-btn" 
                data-action="back" 
                data-design-id="${design.id}"
                style="padding: 0.6rem; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.85rem; color: white; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
              >
                🔄 Verso
              </button>
            </div>
          </div>
        </div>
      `;
    },

    attachButtonEvents() {
      console.log('🔘 [CANVA] attachButtonEvents()');
      
      document.querySelectorAll('.canva-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.stopPropagation();
          const designId = button.getAttribute('data-design-id');
          const action = button.getAttribute('data-action');
          const originalHTML = button.innerHTML;
          
          try {
            button.disabled = true;
            button.innerHTML = '⏳';
            
            const urls = await this.exportDesign(designId, 'png');
            
            if (urls && urls.length > 0) {
              document.dispatchEvent(new CustomEvent('canva:design-imported', {
                detail: { imageUrl: urls[0], action, designId }
              }));
              
              button.innerHTML = '✅';
              button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
              setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
                button.disabled = false;
              }, 2000);
            }
          } catch (error) {
            console.error('❌ [CANVA] Error:', error);
            button.innerHTML = '❌';
            button.style.background = '#dc3545';
            setTimeout(() => {
              button.innerHTML = originalHTML;
              button.style.background = '';
              button.disabled = false;
            }, 2000);
          }
        });
      });
      
      console.log('✅ [CANVA] Events attachés');
    },

    refresh() {
      allDesigns = [];
      currentSearch = '';
      localStorage.removeItem('canva_last_continuation');
      this.displayDesigns();
    }
  };

  // Init
  function init() {
    console.log('🔧 [CANVA] init()');
    
    const checkContainer = () => {
      const container = document.getElementById('canva-designs-container');
      if (container) {
        console.log('✅ [CANVA] Container trouvé');
        window.CanvaDesigns.displayDesigns();
        return true;
      }
      console.warn('⚠️ [CANVA] Container pas encore là');
      return false;
    };
    
    if (!checkContainer()) {
      let attempts = 0;
      const retryInterval = setInterval(() => {
        attempts++;
        console.log(`🔄 [CANVA] Retry ${attempts}/10`);
        if (checkContainer() || attempts >= 10) clearInterval(retryInterval);
      }, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'canva_access_token' && window.CanvaDesigns) {
      setTimeout(() => window.CanvaDesigns.displayDesigns(), 100);
    }
  });
  
  console.log('✅ [CANVA] Ready v7');
})();
