// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_KDP_COOKIES') {
    // On essaie de récupérer les cookies du domaine .com et .fr
    chrome.cookies.getAll({ domain: "amazon.com" }, (cookiesCOM) => {
      chrome.cookies.getAll({ domain: "amazon.fr" }, (cookiesFR) => {
        
        let allCookies = [...(cookiesCOM || []), ...(cookiesFR || [])];

        // On tente aussi de récupérer spécifiquement sur le sous-domaine des rapports
        chrome.cookies.getAll({ domain: "kdpreports.amazon.com" }, (cookiesReports) => {
          allCookies = [...allCookies, ...(cookiesReports || [])];

          if (allCookies.length > 0) {
            console.log("Cookies trouvés :", allCookies.length);
            sendResponse({ success: true, cookies: allCookies });
          } else {
            console.error("Aucun cookie Amazon trouvé dans le navigateur.");
            sendResponse({ success: false });
          }
        });
      });
    });
    return true; // Obligatoire pour sendResponse asynchrone
  }
});