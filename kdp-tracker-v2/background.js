const KDP_URLS = [
  'https://kdp.amazon.com',
  'https://kdp.amazon.co.uk',
  'https://kdp.amazon.de',
  'https://kdp.amazon.fr',
  'https://kdp.amazon.ca',
  'https://kdp.amazon.com.au',
  'https://kdpreports.amazon.com'
];

chrome.runtime.onInstalled.addListener(() => {
  console.log('GabaritKDP Tracker installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_KDP_COOKIES') {
    Promise.all(
      KDP_URLS.map(url =>
        new Promise(resolve => {
          chrome.cookies.getAll({ url }, cookies => {
            resolve({ url, cookies });
          });
        })
      )
    ).then(results => {
      sendResponse({ success: true, data: results });
    });
    return true;
  }
});
// Écoute les demandes venant du Dashboard (via content.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_SYNC_FROM_DASHBOARD') {
    // 1. Envoyer un signal "en cours" au dashboard
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "SYNC_STATUS_UPDATE",
        payload: { status: "running", message: "Synchronisation en cours..." }
      });
    });

    // 2. Ici tu peux appeler ta fonction de scraping existante
    // Une fois fini, tu envoies le succès :
    setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "SYNC_STATUS_UPDATE",
            payload: { status: "success", message: "Données KDP mises à jour !" }
          });
        });
    }, 2000);
  }
});