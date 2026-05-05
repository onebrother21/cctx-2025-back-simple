export class GlassAppState extends EventTarget {
  emit(k){this.dispatchEvent(new Event(k));}
  on(k,f){
    this.addEventListener(k,f);
    this.listeners_.push({id:Math.ceil(Math.random() * 1000),name:k});
  }
  get(k){return this.state_[k];}
  getUser(){return this.state_.user;}
  getProfile(){return this.state_.user?.profile || null;}
  getAppConfig(){return this.state_.appConfig || {};}
  setAppConfig(o){this.state_.appConfig = o;}
  set(k,o){
    this.state_[k] = o;
    // this.save();
  }
  setUser(o){
    this.state_.user = o;
    // this.save();
  }
  setProfile(o){
    this.state_.user.profile = o;
    // this.save();
  }
  save(){window.localStorage.setItem("appstate",JSON.stringify({...this.state_}));}
  load(){
    const o = JSON.parse(window.localStorage.getItem("appstate"));
    this.state_ = {
      ...this.state_,
      ...o,
      currentPage:document.location.href
    };
    // window.localStorage.removeItem("appstate");
  }
  print(){console.log({...this.state_});}
  state_ = {
    start:new Date(),
    appId:Math.ceil(Math.random() * 10000000),
    withOrbs:false,
    sidebarOpen:false,
    currentPage:"",
    user:null,
    auth:null,
    theme:"dark",
    loading:false,
    errors:[],
    authMode:false,
  };
  listeners_ = [];
  constructor(){
    super();
    this.load();
    if(!window.name){
      console.log("setting window name");
      window.name = this.get("appId");
    }
    window.onbeforeunload = (ev) => this.save();
    //window.addEventListener('beforeunload',() => this.save());
  }
}