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
