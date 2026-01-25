const $ = (id) => document.getElementById(id);

function setStatus(msg, isErr=false){
  $("status").textContent = msg;
  $("status").className = "status " + (isErr ? "err" : "ok");
}

async function saveCfg(cfg){
  await chrome.storage.local.set(cfg);
}

async function loadCfg(){
  return await chrome.storage.local.get(["apiBase","email","accessToken"]);
}

$("loginBtn").addEventListener("click", async () => {
  try{
    const apiBase = $("apiBase").value.trim().replace(/\/$/,'');
    const email = $("email").value.trim();
    const password = $("password").value;

    if(!apiBase || !email || !password) return setStatus("Champs manquants.", true);

    const r = await fetch(`${apiBase}/api/ext/login`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });

    const j = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(j.error || "Login failed");

    await saveCfg({ apiBase, email, accessToken: j.access_token });
    setStatus("Connecté. Token enregistré.");
  }catch(e){
    setStatus(e.message, true);
  }
});

$("syncBtn").addEventListener("click", async () => {
  try{
    const cfg = await loadCfg();
    if(!cfg.apiBase) return setStatus("API base manquante.", true);
    if(!cfg.accessToken) return setStatus("Connecte-toi d'abord.", true);

    // Ouvre ou focus KDP Reports
    const url = "https://kdpreports.amazon.com/";
    const tabs = await chrome.tabs.query({ url: "https://kdpreports.amazon.com/*" });
    if (tabs.length) {
      await chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      await chrome.tabs.create({ url });
    }

    setStatus("OK. Va sur l'onglet KDP Reports, les captures vont partir automatiquement.");
  }catch(e){
    setStatus(e.message, true);
  }
});
