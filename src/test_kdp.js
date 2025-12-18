window.Canva = window.Canva || {};
window.Canva.registerActivityAction = function(action, cb) {
  window[action] = cb;
};

window.Canva.registerActivityAction("edit_design:render", async () => {
  alert("✅ Test Canva OK !");
});
