// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_KDP_COOKIES') {
    // On récupère TOUS les cookies d'Amazon
    chrome.cookies.getAll({ domain: "amazon.com" }, (cookies1) => {
      chrome.cookies.getAll({ domain: "amazon.fr" }, (cookies2) => {
        const allCookies = [...cookies1, ...cookies2];
        if (allCookies.length > 0) {
          sendResponse({ success: true, cookies: allCookies });
        } else {
          sendResponse({ success: false, message: "Aucun cookie trouvé. Connectez-vous à KDP." });
        }
      });
    });
    return true; 
  }
});