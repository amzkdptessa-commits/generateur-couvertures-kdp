// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_KDP_COOKIES') {
    // Liste des URLs précises où KDP range ses cookies
    const urls = [
      "https://kdp.amazon.com",
      "https://kdpreports.amazon.com",
      "https://www.amazon.com",
      "https://www.amazon.fr"
    ];

    let allCookies = [];
    let completed = 0;

    urls.forEach(url => {
      chrome.cookies.getAll({ url: url }, (cookies) => {
        if (cookies) {
          allCookies = [...allCookies, ...cookies];
        }
        completed++;
        
        // Une fois qu'on a fait toutes les URLs
        if (completed === urls.length) {
          // On supprime les doublons
          const uniqueCookies = Array.from(new Set(allCookies.map(c => JSON.stringify(c))))
                                    .map(s => JSON.parse(s));

          if (uniqueCookies.length > 0) {
            console.log(uniqueCookies.length + " cookies trouvés");
            sendResponse({ success: true, cookies: uniqueCookies });
          } else {
            sendResponse({ success: false, message: "Aucun cookie trouvé. Connectez-vous à KDP et rafraîchissez la page." });
          }
        }
      });
    });

    return true; // Important pour l'asynchrone
  }
});