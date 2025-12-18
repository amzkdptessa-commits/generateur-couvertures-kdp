// 🎨 BUNNY LOADER - Charge dynamiquement les images depuis Netlify Functions
// Connecte le marketplace aux APIs Bunny CDN

class BunnyLoader {
  constructor() {
    this.baseUrl = '/.netlify/functions';
    this.cache = new Map();
  }

  // Charger les catégories disponibles
  async loadCategories(folder = 'FULL COVER') {
    const cacheKey = `categories_${folder}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/list-categories?folder=${encodeURIComponent(folder)}`);
      const data = await response.json();
      
      if (data.success) {
        this.cache.set(cacheKey, data);
        return data;
      } else {
        throw new Error(data.error || 'Erreur chargement catégories');
      }
    } catch (error) {
      console.error('Erreur loadCategories:', error);
      throw error;
    }
  }

  // Charger les images d'un dossier
  async loadImages(folder) {
    const cacheKey = `images_${folder}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/list-bunny-images?folder=${encodeURIComponent(folder)}`);
      const data = await response.json();
      
      if (data.success) {
        this.cache.set(cacheKey, data);
        return data;
      } else {
        throw new Error(data.error || 'Erreur chargement images');
      }
    } catch (error) {
      console.error('Erreur loadImages:', error);
      throw error;
    }
  }

  // Afficher les images dans une galerie
  displayGallery(images, container) {
    if (!container) {
      console.error('Container not found');
      return;
    }

    // Créer la grille d'images - RESPONSIVE
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6';

    images.forEach((image, index) => {
      const card = this.createImageCard(image, index);
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  // Créer une carte image
  createImageCard(image, index) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300';

    const imgContainer = document.createElement('div');
    imgContainer.style.aspectRatio = '4/3';
    imgContainer.style.overflow = 'hidden';
    imgContainer.style.position = 'relative';
    imgContainer.style.cursor = 'pointer';
    imgContainer.onclick = () => this.openImageModal(image);

    // Placeholder pendant le chargement
    imgContainer.innerHTML = `
      <div class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
        <span class="text-4xl">🖼️</span>
      </div>
    `;

    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.filename;
    img.loading = 'lazy';
    img.className = 'w-full h-full object-cover hover:scale-110 transition-transform duration-300';
    img.style.opacity = '0';
    
    img.onload = () => {
      img.style.transition = 'opacity 0.3s ease';
      img.style.opacity = '1';
      imgContainer.querySelector('.animate-pulse').remove();
    };

    img.onerror = () => {
      imgContainer.innerHTML = `
        <div class="absolute inset-0 bg-red-100 flex items-center justify-center">
          <span class="text-red-500">❌ Erreur chargement</span>
        </div>
      `;
    };

    imgContainer.appendChild(img);

    const info = document.createElement('div');
    info.className = 'p-2 sm:p-3';
    info.innerHTML = `
      <h4 class="font-semibold text-gray-900 text-xs sm:text-sm truncate mb-1 sm:mb-2" title="${image.filename}">${image.filename}</h4>
      <p class="text-xs text-gray-500 mb-2 hidden sm:block">${this.formatFileSize(image.size)}</p>
      <a href="/generator.html?template=${image.url}" 
         onclick="event.stopPropagation()" 
         class="inline-block w-full text-center px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
        ✨ Use template
      </a>
    `;

    card.appendChild(imgContainer);
    card.appendChild(info);

    return card;
  }

  // Formater la taille de fichier
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // Ouvrir une modal pour voir l'image en grand
  openImageModal(image) {
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    };

    const content = document.createElement('div');
    content.className = 'relative max-w-6xl max-h-full';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.className = 'absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10';
    closeBtn.onclick = () => modal.remove();

    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.filename;
    img.className = 'max-w-full max-h-[90vh] object-contain';

    const info = document.createElement('div');
    info.className = 'absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4';
    info.innerHTML = `
      <h3 class="font-bold text-lg mb-2">${image.filename}</h3>
      <div class="flex gap-4 text-sm mb-3">
        <span>📏 ${this.formatFileSize(image.size)}</span>
        <span>📁 ${image.path}</span>
      </div>
      <div class="flex gap-2 flex-wrap">
        <a href="/generator.html?template=${image.url}" class="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold">
          ✨ Use this template
        </a>
        <a href="${image.url}" target="_blank" class="inline-block px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
          🔗 Open image
        </a>
      </div>
    `;

    content.appendChild(closeBtn);
    content.appendChild(img);
    content.appendChild(info);
    modal.appendChild(content);

    document.body.appendChild(modal);

    // ESC pour fermer
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // Afficher un loading
  showLoading(container) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
        <p class="text-gray-600 text-lg">Chargement des images...</p>
      </div>
    `;
  }

  // Afficher une erreur
  showError(container, error) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <span class="text-6xl mb-4">❌</span>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
        <p class="text-gray-600">${error.message || 'Une erreur est survenue'}</p>
        <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">
          Réessayer
        </button>
      </div>
    `;
  }
}

// Instance globale
window.bunnyLoader = new BunnyLoader();

// Fonctions helper pour le HTML
window.loadCategoryImages = async function(categoryPath) {
  console.log('Loading category:', categoryPath);
  
  // Créer ou récupérer le container de la galerie
  let galleryContainer = document.getElementById('galleryContainer');
  
  if (!galleryContainer) {
    // Créer la modal de galerie
    const modal = document.createElement('div');
    modal.id = 'galleryModal';
    modal.className = 'fixed inset-0 bg-white z-50 overflow-y-auto';
    
    modal.innerHTML = `
      <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div class="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate pr-2" id="galleryTitle">Chargement...</h2>
          <button onclick="closeGallery()" class="text-gray-600 hover:text-gray-900 text-2xl sm:text-3xl flex-shrink-0 w-10 h-10 flex items-center justify-center">✕</button>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div id="galleryContainer"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    galleryContainer = document.getElementById('galleryContainer');
  }

  // Afficher le loading
  window.bunnyLoader.showLoading(galleryContainer);
  
  try {
    // Charger les images
    const data = await window.bunnyLoader.loadImages(categoryPath);
    
    // Mettre à jour le titre
    document.getElementById('galleryTitle').textContent = `${categoryPath} (${data.totalFiles} images)`;
    
    // Afficher les images
    window.bunnyLoader.displayGallery(data.files, galleryContainer);
    
  } catch (error) {
    console.error('Erreur:', error);
    window.bunnyLoader.showError(galleryContainer, error);
  }
};

window.closeGallery = function() {
  const modal = document.getElementById('galleryModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
};

console.log('✅ Bunny Loader initialisé');
