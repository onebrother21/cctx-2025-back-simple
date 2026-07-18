import { httpReq,shortDate } from './core/index.js';

export class GlassApp {
  static config = async (data) => {
    try{
      const body = await httpReq({method:"GET",url:`/glass/config`});
      console.log(body);
      gs.setConfig(body.data);
    }
    catch(e){console.error(e.message,e);}
  };
  static handler = async (current,data) => {
    switch(true){
      case /signup/.test(current):await glassAuth.signup(data);break;
      case /verify/.test(current):await glassAuth.verify(data);break;
      case /register/.test(current):await glassAuth.register(data);break;
      case /login/.test(current):await glassAuth.login(data);break;

      case /job/.test(current):await glassMethods.postJob(data);break;
      case /test/.test(current):await glassMethods.testNotification(data);break;

      case /numbers/.test(current):{
        switch(data.action){
          case "run-gap-fill":
          case "run-pos-shift":
          case "run-moving-v":await glassNumbers.runSingleStrategy(data);break;
          case "run-sim":await glassNumbers.runStrategySim(data);break;
          case "run-ncr":await glassNumbers.calcComboProbility(data);break;
          default:break;
        }
      }
      default:break;
    }
  };
  static main = async () => {
    const url = window.location.href;
    const authMode = /signup|verify|register|login/.test(url);
    gs.set("auth_mode",authMode);
    gs.set("app_startLocal",shortDate(gs.get("app_start"),true));
    await glassAuth.autologin();

    switch(true){
      case /hm/.test(url):
      case /numbers/.test(url):{
        glassNumbers.init();
        gs.print();
        break;
      }
    }
  };
}