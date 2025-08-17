(async function(window){
  class CCV1 {
    start = Date.now();
    config;
    //get bizInfo(){return this.config.biz_info;}
    constructor(config){this.config = config;}
    //getPrimary(n){return n * this.config.biz_info.testN;}
    //getSecondary(n){return Math.pow(this.config.biz_info.testN,n);}
    async connect(){
      try {
        const authtkn_ = window.localStorage.getItem("authToken");
        const authTkn = authtkn_?(JSON.parse(authtkn_) || {}).accessToken:"";
        const csrfTkn = window.localStorage.getItem("csrfToken") || "";
        const device = window.localStorage.getItem("appDevice");
        const client = device?JSON.parse(device):{};
        const body = {data:client,enc:false};
        
        const reqOpts = {
          method:"POST",
          body:JSON.stringify(body),
          mode:"cors",
          credentials:"include",
          headers:{
            "Origin":this.config.appDomain,
            "Content-Type":"application/json",
            "Accept":"application/json",
            ...(authTkn?{"Authorization":`Bearer ${authTkn}`}:null),
            ...(csrfTkn?{"x-csrf-token":csrfTkn}:null),
          }
        };
        console.log(reqOpts)
        const resp = await fetch(`${this.config.apiHost}/${this.config.apiPath}/connect`,reqOpts);
        const json = await resp.json();
        if(!resp.ok) throw json;
        if(json.csrfToken) window.localStorage.setItem("csrfToken",json.csrfToken);
        if(json.authToken) window.localStorage.setItem("authToken",JSON.stringify(json.authToken));
        return json;
      }
      catch(e){
        console.log(e);
        throw(e);
      }
    }
    async end(){}
    test(){console.log("lets go")}
  }
  window.CCV1 = (config) => {return new CCV1(config);};
})(window);