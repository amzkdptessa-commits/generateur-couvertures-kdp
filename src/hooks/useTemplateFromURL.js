// src/hooks/useTemplateFromURL.js
import { useEffect } from 'react';

/**
 * Hook pour charger automatiquement un template depuis l'URL
 * Supporte les paramètres marketplace :
 * - ?template=URL_IMAGE&src=pixabay
 * - ?img=URL_IMAGE&src=pixabay
 * - ?trim=6x9
 */
export function useTemplateFromURL(onTemplateLoad) {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      
      // Lire les paramètres marketplace
      const templateURL = params.get('template') || params.get('img');
      const source = params.get('src');
      const trim = params.get('trim');
      
      if (templateURL) {
        console.log('🎨 [MARKETPLACE] Template détecté:', {
          url: templateURL,
          source,
          trim
        });
        
        // Décoder l'URL du template
        const decodedURL = decodeURIComponent(templateURL);
        
        // Appeler le callback avec les données
        if (onTemplateLoad) {
          onTemplateLoad({
            imageURL: decodedURL,
            source: source || 'marketplace',
            format: trim || '6x9',
          });
        }
      } else {
        console.log('ℹ️ [MARKETPLACE] Aucun template dans URL, mode normal');
      }
    } catch (error) {
      console.error('❌ [MARKETPLACE] Erreur lecture URL:', error);
    }
  }, [onTemplateLoad]);
}