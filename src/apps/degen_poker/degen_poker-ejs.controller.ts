export class DegenPokerEjsController {
  static CheckLogin:IHandler = async (req,res,next) => {
    //Utils.info({...req.session});
    switch(true){
      case !req.session.user:
      case !req.session.auth:
      case !req.session.expires:{
        res.redirect(`/degen_poker/login`);
        break;
      }
      case req.session.expires < Date.now():{
        req.session.expires = null;
        res.redirect(`/degen_poker/login?expired=true`);
        break;
      }
      default:{
        next();
        break;
      }
    }
  };
  static HandleRoute:(page:string) => IHandler = (page) => (req,res) => {
    const data:any = {page,ui:{sidebarMenu}};
    switch(page){
      case "signup":{
        data.invalid = req.query.invalid === 'true',
        data.expired = req.query.expired === 'true',
        data.user = null;
        break;
      }
      case "verify":{
        data.invalid = req.query.invalid === 'true',
        data.expired = req.query.expired === 'true',
        data.user = null;
        break;
      }
      case "register":{
        data.invalid = req.query.invalid === 'true',
        data.expired = req.query.expired === 'true',
        data.user = null;
        break;
      }
      case "login":{
        data.invalid = req.query.invalid === 'true',
        data.expired = req.query.expired === 'true',
        data.user = null;
        break;
      }
      case "reset-pin":{
        data.invalid = req.query.invalid === 'true',
        data.expired = req.query.expired === 'true',
        data.user = null;
        break;
      }
      case "dash":{
        data.ui.title = "Dashboard Overview";
        data.ui.withSearch = true;
        break;
      }
      case "analytics":{
        data.ui.title = "Analytics";
        data.ui.withSearch = true;
        break;
      }
      case "users":{
        data.ui.title = "Users";
        data.ui.withSearch = true;
        break;
      }
      case "about":data.ui.title = "About Us";break;
      case "settings":data.ui.title = "Settings";break;
      case "chats":data.ui.title = "Chats";break;
      case "chat":data.ui.title = "ChatBox";break;
      case "numbers":data.ui.title = "Numbers Tester";break;
      default:break;
    }
    data.user = req.session.user || null;
    if(page == "home") res.redirect(`/degen_poker/hm`);
    else res.render('degen_poker-index',data);
  };
}
const sidebarMenu = [
  {
    url:"/degen_poker/hm",
    icon:"four-boxes",
    label:"Dashboard",
  },{
    url:"/degen_poker/analytics",
    icon:"paper-stack",
    label:"Analytics",
    text:"New",
  },{
    url:"/degen_poker/users",
    icon:"users",
    label:"Users",
  },{
    url:"/degen_poker/chats",
    icon:"users",
    label:"Chats",
  },{
    url:"/degen_poker/settings",
    icon:"gear",
    label:"Settings",
  },{
    url:"/degen_poker/numbers",
    icon:"gear",
    label:"Numbers Tester",
  }
];