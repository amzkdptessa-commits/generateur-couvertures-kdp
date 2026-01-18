// Écoute les messages venant du site web GabaritKDP
window.addEventListener("message", (event) => {
  if (event.data.source === "gkdp-dashboard" && event.data.type === "GKDP_EXTENSION_PING") {
    window.postMessage({
      source: "gkdp-extension",
      type: "GKDP_EXTENSION_PONG",
      payload: { version: "1.0.1" }
    }, "*");
  }
});