// GabaritKDP Bridge - content.js
console.log("GabaritKDP Tracker: Content Script Active");

// 1. Détection : Répondre au Dashboard quand il demande "Es-tu là ?"
window.addEventListener("message", (event) => {
  // Sécurité : on n'écoute que les messages qui viennent de notre propre Dashboard
  if (event.data.source === "gkdp-dashboard") {

    // Réponse au PING pour l'affichage du statut "Extension Detected"
    if (event.data.type === "GKDP_EXTENSION_PING") {
      window.postMessage({
        source: "gkdp-extension",
        type: "GKDP_EXTENSION_PONG",
        payload: { version: "1.0.4" }
      }, "*");
    }

    // Relais du bouton "REFRESH DATA" du Dashboard vers le background de l'extension
    if (event.data.type === "GKDP_START_SYNC") {
      chrome.runtime.sendMessage({
        type: "START_SYNC_FROM_DASHBOARD",
        payload: event.data.payload
      });
    }
  }
});

// 2. Retour d'infos : Envoyer les statuts de synchro vers le Dashboard (le petit toast)
chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "SYNC_STATUS_UPDATE") {
    window.postMessage({
      source: "gkdp-extension",
      type: "GKDP_SYNC_STATUS",
      payload: request.payload
    }, "*");
  }
});
