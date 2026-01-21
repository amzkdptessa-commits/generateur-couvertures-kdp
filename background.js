// background.js - Service Worker V3 (Version "Aspirateur")
console.log('🚀 GabaritKDP Service Worker Démarré');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    captureAllCookies()
      .then(cookies => {
        console.log(`📤 Envoi de ${cookies.length} cookies à la popup`);
        sendResponse({ success: true, cookies: cookies });
      })
      .catch(error => {
        console.error('❌ Erreur:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Important pour l'asynchrone
  }
});

async function captureAllCookies() {
  console.log('🍪 Démarrage de la capture multi-domaines...');

  // Liste de toutes les URLs possibles où des cookies de session peuvent se cacher
  const targetUrls = [
    'https://kdpreports.amazon.com',
    'https://www.amazon.fr',
    'https://www.amazon.com',
    'https://www.amazon.co.uk',
    'https://www.amazon.de',
    'https://www.amazon.ca',
    'https://www.amazon.com.au'
  ];

  let allCookies = [];

  // On boucle sur chaque domaine pour récupérer les cookies
  for (const url of targetUrls) {
    try {
      const cookies = await chrome.cookies.getAll({ url: url });
      console.log(`📍 ${url} : ${cookies.length} cookies trouvés`);
      allCookies = [...allCookies, ...cookies];
    } catch (e) {
      console.warn(`Impossible de lire ${url}`, e);
    }
  }

  // Filtrage : On ne garde que les cookies importants
  const kdpCookies = allCookies.filter(cookie => {
    const name = cookie.name.toLowerCase();
    return (
      name.includes('session') ||
      name.includes('ubid') ||
      name.includes('at-') ||
      name.includes('x-') ||
      name === 'token' ||
      name.includes('csrf')
    );
  });

  // Dédoublonnage (car amazon.fr et kdpreports peuvent partager des cookies .amazon.fr)
  const uniqueCookiesMap = new Map();
  kdpCookies.forEach(c => {
    // On utilise nom + domain comme clé unique
    uniqueCookiesMap.set(c.name + c.domain, c);
  });

  const finalCookies = Array.from(uniqueCookiesMap.values());

  console.log(`✅ TOTAL FINAL : ${finalCookies.length} cookies uniques prêts à l'envoi.`);
  
  // Debug pour vérifier si on a bien chopé la session FR
  const hasFrSession = finalCookies.some(c => c.domain.includes('.amazon.fr') && c.name.includes('session-id'));
  if (hasFrSession) console.log('🎉 SESSION FR DÉTECTÉE !');
  else console.warn('⚠️ Pas de session FR détectée explicitement.');

  return finalCookies;
}

// Alarmes (nécessite la permission "alarms")
chrome.alarms.create('autoSync', { periodInMinutes: 10 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    console.log('⏰ Auto-sync déclenché');
  }
});
