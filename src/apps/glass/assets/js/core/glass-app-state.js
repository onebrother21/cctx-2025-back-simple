export class GlassAppState extends EventTarget {
  state_ = {
    app_start:new Date(),
    app_startLocal:"",
    app_id:Math.ceil(Math.random() * 10000000),
    app_config:null,
    app_version:"",
    app_loading:false,
    app_errors:[],
    ui_sidebarMenu,
    ui_sidebarOpen:false,
    ui_withOrbs:false,
    ui_theme:"dark",
    nav_currentPage:"",
    nav_currentTab:"",
    auth_tkn:null,
    auth_user:null,
    auth_mode:false,
    auth_expires:null,
    user:null,
    user_profile:null,
  };
  listeners_ = [];
  constructor(){
    super();
    this.load();
    this.setWindowName();
    this.autosaveBeforeUnload();
  }
  setWindowName = () => {
    if(!window.name){
      console.log("setting window name");
      window.name = this.get("app_id");
    }
  };
  autosaveBeforeUnload = () => window.onbeforeunload = (ev) => this.save();
  //window.addEventListener('beforeunload',() => this.save());
  clear = () => {
    this.state_ = {};
    window.location.reload();
  };
  get = (k) => this.state_[k];
  set = (k,o)=> this.state_[k] = o;
  getUser = () => this.state_.user;
  setUser = (o) => {
    this.state_.user = o;
    this.state_.user_profile = o?.profile || null;
  };
  getProfile = () => this.state_.user_profile || null;
  setProfile = (o) => this.state_.user_profile = o;
  getConfig = () => this.state_.app_config || {};
  setConfig = (o) => this.state_.app_config = o;

  save = () => window.localStorage.setItem("appstate",JSON.stringify({...this.state_}));
  load = () => {
    const o = JSON.parse(window.localStorage.getItem("appstate"));
    this.state_ = {
      ...this.state_,
      ...o,
      nav_currentPage:document.location.href
    };
    // window.localStorage.removeItem("appstate");
  }
  
  emit = (k) => this.dispatchEvent(new Event(k));
  on = (k,f) => {
    this.addEventListener(k,f);
    this.listeners_.push({id:Math.ceil(Math.random() * 1000),name:k});
  };
  print = () => console.log(this.state_);
}
const ui_sidebarMenu = [
  {
    url:"/glass/hm",
    icon:"four-boxes",
    label:"Dashboard",
  },{
    url:"/glass/analytics",
    icon:"paper-stack",
    label:"Analytics",
    text:"New",
  },{
    url:"/glass/users",
    icon:"users",
    label:"Users",
  },{
    url:"/glass/chats",
    icon:"users",
    label:"Chats",
  },{
    url:"/glass/settings",
    icon:"gear",
    label:"Settings",
  },{
    url:"/glass/numbers",
    icon:"gear",
    label:"Numbers Tester",
  }
];
const msgs = [
{
  authorImg:"/images/avatar6.png",
  authorUsername:"Angela",
  timeAgo:"2 minutes ago",
  authorName:"John Doe",
  body:"purchased Premium Plan",
}
]