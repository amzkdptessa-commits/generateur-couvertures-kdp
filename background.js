// background.js - Service Worker pour Manifest V3
console.log('🚀 GabaritKDP Tracker Service Worker démarré');

// Installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Extension installée avec succès');
});

// Écouter les messages de la popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📩 Message reçu:', request);

  if (request.action === 'getCookies') {
    // Capturer les cookies Amazon
    captureCookies(request.marketplace)
      .then(cookies => {
        console.log(`✅ ${cookies.length} cookies capturés`);
        sendResponse({ success: true, cookies: cookies });
      })
      .catch(error => {
        console.error('❌ Erreur capture cookies:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // IMPORTANT: Retourner true pour indiquer une réponse asynchrone
    return true;
  }
});

// Fonction pour capturer les cookies - VERSION CORRIGÉE
async function captureCookies(marketplace) {
  console.log('🍪 Capture des cookies pour marketplace:', marketplace);

  // 1. Mappage Marketplace -> URL (pas juste le domaine)
  // On utilise l'URL principale du magasin car c'est là que résident les cookies "maîtres"
  const urls = {
    'US': 'https://www.amazon.com',
    'UK': 'https://www.amazon.co.uk',
    'DE': 'https://www.amazon.de',
    'FR': 'https://www.amazon.fr',
    'CA': 'https://www.amazon.ca',
    'AU': 'https://www.amazon.com.au'
  };

  const targetUrl = urls[marketplace] || 'https://www.amazon.com';
  console.log('🌍 URL Cible pour extraction:', targetUrl);

  try {
    // 2. CRITIQUE : Utiliser 'url' au lieu de 'domain'
    // Cela récupère les cookies HostOnly + les cookies de domaine (.amazon.com)
    const storeCookies = await chrome.cookies.getAll({ url: targetUrl });
    const reportCookies = await chrome.cookies.getAll({ url: 'https://kdpreports.amazon.com' });
    
    // Fusionner les deux sources
    const allCookies = [...storeCookies, ...reportCookies];
    
    console.log(`📦 ${allCookies.length} cookies bruts trouvés (${storeCookies.length} store + ${reportCookies.length} reports)`);

    if (allCookies.length === 0) {
      console.warn("⚠️ Attention: 0 cookies trouvés. Vérifiez si l'utilisateur est connecté sur : " + targetUrl);
    }

    // 3. Filtrage des cookies pertinents
    const kdpCookies = allCookies.filter(cookie => {
      const name = cookie.name.toLowerCase();
      return (
        name.includes('session') ||
        name.includes('ubid') ||
        name.includes('at-') ||
        name.includes('x-') ||
        name === 'token' ||
        name.includes('csrf') ||
        name === 'session-id' ||
        name === 'session-id-time' ||
        name === 'session-token'
      );
    });

    // Dédoublonner par nom de cookie
    const uniqueCookies = Array.from(
      new Map(kdpCookies.map(c => [c.name, c])).values()
    );

    console.log(`🎯 ${uniqueCookies.length} cookies KDP pertinents filtrés`);
    console.log('Noms des cookies:', uniqueCookies.map(c => c.name).join(', '));

    return uniqueCookies;

  } catch (error) {
    console.error('❌ Erreur dans captureCookies:', error);
    throw error;
  }
}

// Auto-sync toutes les 10 minutes (optionnel)
chrome.alarms.create('autoSync', { periodInMinutes: 10 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    console.log('⏰ Auto-sync déclenché');
  }
});
