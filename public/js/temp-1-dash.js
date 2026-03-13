const loadData = () => JSON.parse(window.localStorage.getItem("cctx_admn") || "null");
const saveData = o => window.localStorage.setItem("cctx_admn",JSON.stringify({...loadData(),o}));

(async function(window){
  class CCTX_AdminUIDash {
    slideIndex = 1;
    plusDivs(n) {this.showDivs(this.slideIndex += n);}
    currentDiv(n) {this.showDivs(this.slideIndex = n);}
    showDivs(n) {
      var i;
      var x = document.getElementsByClassName("mySlides");
      var dots = document.getElementsByClassName("demo");
      if (n > x.length) {this.slideIndex = 1}
      if (n < 1) {this.slideIndex = x.length}
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" w3-opacity-off", "");
      }
      x[this.slideIndex-1].style.display = "block";
      dots[this.slideIndex-1].className += " w3-opacity-off";
    }
    openLink(evt, linkName) {
      var i, x, tablinks;
      x = document.getElementsByClassName("myLink");
      for (i = 0; i < x.length; i++) x[i].style.display = "none";
      tablinks = document.getElementsByClassName("tablink");
      for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-red", "");
      }
      document.getElementById(linkName).style.display = "block";
      evt.currentTarget.className += " w3-red";
    }
    init(){
      this.showDivs(this.slideIndex);
      var mytab = document.getElementsByClassName("tablink")[0];
      mytab.click();
      window.CCTX.test();
    }
  }
  window.CCTXDash = new CCTX_AdminUIDash();
  document.addEventListener('DOMContentLoaded', () => window.CCTXDash.init());
})(window);