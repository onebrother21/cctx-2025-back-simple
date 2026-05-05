//use as actions,reducer, selector and effect
export class AppState extends EventTarget {
  emit(k){this.dispatchEvent(new Event(k));}
  on(k,f){
    this.addEventListener(k,f);
    this.listeners.push({id:Math.ceil(Math.random() * 1000),name:k});
  }
  get(k){return this.state_[k];}
  set(k,o){this.state_[k] = o;this.save();}
  getUser(){return this.state_.user;}
  setUser(o){
    this.state_.user = o;
    this.save();
  }
  save(){window.localStorage.setItem("appstate",JSON.stringify({...this.state_}));}
  load(){
    const o = JSON.parse(window.localStorage.getItem("appstate"));
    this.state_ = {
      ...this.state_,
      ...o,
      currentPage:document.location.href
    };
  }
  print(){console.log({...this.state_});}
  state_ = {
    currentPage:"",
    user:null,
    auth:null,
    theme:"dark",
    loading:false,
    errors:[],
  };
  listeners = [];
  constructor(){
    super();
    this.load();
    this.set("myData",{ready:true,value:3});
    this.on('something',ev => {
      console.log('Instance fired "something".',ev);
      console.log('Data to use in callback',this.get("myData"))
    });
    this.emit("something");
  }
}