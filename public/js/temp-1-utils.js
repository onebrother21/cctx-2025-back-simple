const loadData = () => JSON.parse(window.localStorage.getItem("cctx_admn") || "null");
const saveData = o => window.localStorage.setItem("cctx_admn",JSON.stringify({...loadData(),o}));

(async function(window){
  class CCTX_AdminUIUtils {
    save = saveData;
    load = loadData;
    slideIndex = 1;
    test(){console.log(this.load())}
    getUser(){this.load()?.user || null;}
    w3_open() {
      document.getElementById("mySidebar").style.display = "block";
      document.getElementById("myOverlay").style.display = "block";
    }
    w3_close() {
      document.getElementById("mySidebar").style.display = "none";
      document.getElementById("myOverlay").style.display = "none";
    }
  }
  window.CCTX = new CCTX_AdminUIUtils();
})(window);