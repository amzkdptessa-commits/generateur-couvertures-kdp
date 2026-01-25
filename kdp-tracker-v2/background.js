// background.js (MV3 module)
async function getCfg(){
  return await chrome.storage.local.get(["apiBase","accessToken"]);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg?.type === "GKDP_CAPTURE_BATCH"){
    (async () => {
      const cfg = await getCfg();
      const apiBase = (cfg.apiBase || "").replace(/\/$/,'');
      const token = cfg.accessToken;

      if(!apiBase || !token) return;

      // payload compact
      const payload = {
        version: "ext-sniffer-v1",
        captured_at: new Date().toISOString(),
        pages: {}
      };

      for(const it of (msg.payload?.items || [])){
        payload.pages[it.url] = it.data;
      }

      const r = await fetch(`${apiBase}/api/ingest`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ payload })
      });

      if(!r.ok){
        const txt = await r.text();
        console.error("GKDP ingest failed:", r.status, txt);
      } else {
        console.log("GKDP ingest OK");
      }
    })();
  }
});
