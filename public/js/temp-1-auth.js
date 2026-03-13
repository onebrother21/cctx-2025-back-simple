(async function(window){
  class CCTX_AdminUIAuth {
    appName = "/av3/cctx/admn/sys/ui";
    loginUrl = `${this.appName}/login`;
    dashUrl = `${this.appName}/dash`;
    logoutUrl = `${this.appName}/logout`;
    role = `${this.appName}-app-admn`;
    
    login = (data) => {
      const {loginUrl,dashUrl,role} = this;
      fetch(loginUrl, {
        method: "POST",
        body:JSON.stringify({data:{...data,role}}),
        credentials:"include",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "x-cctx-e2e":"0",
        }
      })
      .then((res) => {
        if(res.redirected){
          document.location.href = dashUrl;
          this.save({user:data.emailOrUsername});
        }
      })
      .catch((e) => console.error(e));
    };
    logout = () => {
      const {logoutUrl,loginUrl} = this;
      fetch(logoutUrl, {
        method: "GET",
        credentials:"include",
      })
      .then((response) => {if(response.redirected) document.location.href = loginUrl;})
      .catch((e) => console.error(e));
    }
    init(){
      const authForm = document.querySelector('#authForm');
      console.log(authForm)
      authForm.addEventListener('submit',event => {
        event.preventDefault();
        const formData = new FormData(authForm);
        const data = Object.fromEntries(formData.entries());
        console.log({data})
        this.login(data);
      });
    }
  }
  window.CCTXAuth = new CCTX_AdminUIAuth();
  document.addEventListener('DOMContentLoaded',() => window.CCTXAuth.init());
})(window);