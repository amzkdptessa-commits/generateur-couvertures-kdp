// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_KDP_COOKIES') {
    // On cherche sur tous les domaines Amazon possibles
    const domains = [".amazon.com", "amazon.com", ".amazon.fr", "amazon.fr", ".amazon.co.uk", "amazon.co.uk"];
    let allCookies = [];
    let processed = 0;

    domains.forEach(dom => {
      chrome.cookies.getAll({ domain: dom }, (cookies) => {
        if (cookies) allCookies = [...allCookies, ...cookies];
        processed++;
        
        if (processed === domains.length) {
          if (allCookies.length > 0) {
            // Filtrage pour ne garder que les cookies utiles (session)
            const filtered = allCookies.filter(c => 
              c.name.includes('session') || c.name.includes('at-main') || c.name.includes('ubid')
            );
            sendResponse({ success: true, cookies: filtered });
          } else {
            sendResponse({ success: false });
          }
        }
      });
    });
    return true;
  }
});