// page-sniffer.js (MAIN WORLD)
(function () {
  const ALLOW = [
    "/reports/dashboard/overview",
    "/reports/dashboard/marketplaceDistributionOverview",
    "/reports/dashboard/formatDistributionOverview",
    "/reports/dashboard/topEarningTitles",
    "/reports/dashboard/histogramOverview/ORDERS",
    "/reports/mtd/DIGITAL",
    "/reports/mtd/KENP",
    "/metadata/customer/accountInfo",
    "/api/v2/reports/customerPreferences",
    "/api/v2/reports/reportingViewPreferences"
  ];

  function okUrl(url){
    if(!url) return false;
    url = String(url);
    if(!url.includes("kdpreports.amazon.com")) return false;
    return ALLOW.some(p => url.includes(p));
  }

  const FLUSH_MS = 1200;
  let buf = [];
  let t = null;

  function flush(){
    t = null;
    if(!buf.length) return;
    window.postMessage({ type:"GKDP_KDP_BATCH", payload:{ ts:new Date().toISOString(), items: buf } }, "*");
    buf = [];
  }
  function push(url,data){
    buf.push({ url, data });
    if(!t) t = setTimeout(flush, FLUSH_MS);
  }

  const origFetch = window.fetch;
  window.fetch = async function(...args){
    const res = await origFetch.apply(this, args);
    try{
      const url = String(args[0] || "");
      if(okUrl(url)){
        const clone = res.clone();
        const ct = clone.headers.get("content-type") || "";
        if(ct.includes("application/json")){
          const data = await clone.json();
          push(url, data);
        }
      }
    }catch(e){}
    return res;
  };

  const XHROpen = XMLHttpRequest.prototype.open;
  const XHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest){
    this.__gkdp_url = url;
    return XHROpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function(...args){
    this.addEventListener("load", function(){
      try{
        const url = String(this.__gkdp_url || "");
        if(!okUrl(url)) return;
        const ct = this.getResponseHeader("content-type") || "";
        if(!ct.includes("application/json")) return;
        const data = JSON.parse(this.responseText);
        push(url, data);
      }catch(e){}
    });
    return XHRSend.apply(this, args);
  };

  console.log("GKDP sniffer injected.");
})();
