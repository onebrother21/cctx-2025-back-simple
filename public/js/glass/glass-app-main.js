import { httpReq,initGlassUI } from './core/index.js';

export class GlassApp {
  static myConfig = async (data) => {
    try{
      const body = await httpReq({method:"GET",url:`/glass/config`});
      console.log(body);
      glassState.setAppConfig(body.data);
    }
    catch(e){console.error(e.message,e);}
  };
  static myHandler = async form => {
    const current = document.location.href;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
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
    initGlassUI(this.myHandler);
    const url = window.location.href;
    const authMode = /signup|verify|register|login/.test(url);
    glassState.set("authMode",authMode);
    await glassAuth.autologin();

    switch(true){
      case /hm/.test(url):
      case /numbers/.test(url):{
        glassNumbers.init();
        glassState.print();
        break;
      }
    }
  };
}