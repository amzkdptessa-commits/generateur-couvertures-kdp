/* popup.js - MV3 */
const els = {
  status: document.getElementById("status"),
  userEmail: document.getElementById("userEmail"),
  sbUrl: document.getElementById("sbUrl"),
  sbKey: document.getElementById("sbKey"),
  save: document.getElementById("save"),
  sync: document.getElementById("sync"),
};

function setStatus(kind, title, msg, hint = "") {
  els.status.classList.remove("error", "ok");
  if (kind === "error") els.status.classList.add("error");
  if (kind === "ok") els.status.classList.add("ok");
  els.status.innerHTML = `
    <div class="title">${title}</div>
    <div class="msg">${msg}</div>
    ${hint ? `<div class="hint">${hint}</div>` : "" }
  `;
}

async function loadSettings() {
  const { gkdp_user_email, gkdp_supabase_url, gkdp_supabase_key } = await chrome.storage.local.get([
    "gkdp_user_email",
    "gkdp_supabase_url",
    "gkdp_supabase_key",
  ]);

  els.userEmail.value = gkdp_user_email || "";
  els.sbUrl.value = gkdp_supabase_url || "https://bgcspojhiupcrpzlkwax.supabase.co";
  els.sbKey.value = gkdp_supabase_key || "";
}

async function saveSettings() {
  const payload = {
    gkdp_user_email: (els.userEmail.value || "").trim(),
    gkdp_supabase_url: (els.sbUrl.value || "").trim(),
    gkdp_supabase_key: (els.sbKey.value || "").trim(),
  };
  await chrome.storage.local.set(payload);
  setStatus("ok", "Sauvegardé", "Paramètres enregistrés.", "Tu peux maintenant lancer la synchronisation.");
}

async function syncNow() {
  const user_email = (els.userEmail.value || "").trim();
  const supabaseUrl = (els.sbUrl.value || "").trim();
  const supabaseKey = (els.sbKey.value || "").trim();

  if (!user_email) {
    setStatus("error", "Email manquant", "Renseigne l’email de suivi.", "Ex: amzkdptessa@gmail.com (clé de compte Tracker).");
    return;
  }
  if (!supabaseUrl || !supabaseKey) {
    setStatus("error", "Supabase incomplet", "Renseigne Supabase URL + publishable key.", "Tu peux les sauvegarder avec le bouton Sauvegarder.");
    return;
  }

  els.sync.disabled = true;
  els.save.disabled = true;

  try {
    setStatus("", "Synchronisation…", "Ouverture/ciblage de KDP Reports puis capture des JSON…");

    const res = await chrome.runtime.sendMessage({
      type: "GKDP_SYNC",
      payload: { user_email, supabaseUrl, supabaseKey }
    });

    if (!res?.ok) {
      throw new Error(res?.error || "Erreur inconnue.");
    }

    setStatus("ok", "Synchronisation réussie", `1 report inséré (pages: ${res.pageKeys?.join(", ") || "?"}).`, "Tu peux vérifier dans Supabase : table kdp_reports.");
  } catch (e) {
    setStatus("error", "Erreur", e.message || String(e), "Vérifie que tu es bien connecté sur kdpreports.amazon.com, puis réessaie.");
  } finally {
    els.sync.disabled = false;
    els.save.disabled = false;
  }
}

els.save.addEventListener("click", saveSettings);
els.sync.addEventListener("click", syncNow);
loadSettings();
