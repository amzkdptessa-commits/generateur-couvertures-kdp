const DEFAULT_API_URL = "http://localhost:3000";

function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["GKDP_API_URL"], (result) => {
      resolve(result.GKDP_API_URL || DEFAULT_API_URL);
    });
  });
}

document.getElementById("sync-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const status = document.getElementById("status");

  if (!email || !password) {
    status.textContent = "Veuillez remplir les champs";
    return;
  }

  const API_URL = await getApiUrl();

  status.textContent = "Récupération des cookies KDP Reports...";

  chrome.runtime.sendMessage({ type: "GET_KDP_COOKIES" }, async (response) => {
    if (response && response.success) {
      status.textContent = "Envoi au serveur...";

      try {
        const res = await fetch(`${API_URL}/api/sync-kdp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            cookies: response.cookies,
            csrfToken: response.csrfToken,
            marketplace: "US"
            // Optionnel :
            // year: 2026,
            // month: 1
          })
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Erreur API: ${res.status} ${txt}`);
        }

        const result = await res.json();
        status.textContent = "Synchronisation réussie !";
        console.log("Résultat:", result);
      } catch (e) {
        console.error("Erreur:", e);
        status.textContent = "Erreur de connexion au serveur";
      }
    } else {
      status.textContent = (response && response.message) || "Connectez-vous à KDP d'abord";
    }
  });
});
