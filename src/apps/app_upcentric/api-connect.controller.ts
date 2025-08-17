
import Utils from "../../utils";
import { UAParser } from "ua-parser-js";

const deviceCookie = process.env.DEVICE_COOKIE || 'deviceCookie';

export class ApiConnectionController {
  static appConfig:IHandler = async (req,res,next) => {
    const proxyHost = req.headers["x-forwarded-host"];
    const host = proxyHost || req.headers.host;
    
    const config = {
      apiDomain:host,
      apiVersion:Utils.version(),
      secureMode:Utils.isEnv("prod"),
      "companyName": "Upcentric Technologies",
      "supportEmail": "support@upcentric.com",
      "theme": "dark",
      "language": "en-US",
      "features": {
        "enableChat": true,
        "enablePayments": false,
        "enableNotifications": false
      },
      "ekey":process.env["ENCRYPTION_PUBLIC"],
      "apis":{
        upcentric:{
          apiKey: "AIzaSyDikv9Ug3cvrQFC0nBWkTqc9ewVqqnT-gb",
          //authDomain: "hashdash-1c1ed.firebaseapp.com",
          appId: "1:309648836827:web:d6f692b05a9ea8111be4fd"
        },
        firebase:{
          apiKey: "AIzaSyDikv9Ug3cvrQFC0nBWkTqc9ewVqqnT-gw",
          authDomain: "hashdash-1c1ed.firebaseapp.com",
          projectId: "hashdash-1c1ed",
          storageBucket: "hashdash-1c1ed.firebasestorage.app",
          messagingSenderId: "309648836827",
          appId: "1:309648836827:web:d6f692b05a9ea8111be4fe"
        },
      }
    };
    res.locals.success = true;
    res.locals.data = config;
    next();
  }
  static appConnect:IHandler = async (req,res,next) => {
    const {data} = req.body;
    if(!req.device){
      const ip = req.ip;
      const deviceParser:any = new UAParser(req.headers["user-agent"]);
      const deviceData:any = deviceParser.getResult() || {};
      const deviceId = Utils.longId();
      const device = {id:deviceId,ip,...deviceData,...data};
      res.cookie(deviceCookie,Utils.encrypt(device),{ 
        sameSite:"none",  // Recommend you make this strict if posible
        path:"/",
        secure: true,//process.env.NODE_ENV === 'production',
        httpOnly:true,
        signed:true,
      });
      req.device = device;
    }
    res.locals.success = true;
    res.locals.data = {connected:true};
    next();
  }
  static appClient:IHandler = async (req,res,next) => {
    //to flush device cookies, change cookie name (slug)
    Utils.log(req.session.meta);
    const meta = req.session.meta?Utils.parse(Utils.decrypt(req.session.meta)):{};
    const {make,model,mobile,id,ts} = meta.client||{};
    req.device = meta.client;
    const device = make?`${make} ${model} ${mobile?"mobile":""}`:"unknown";
    Utils.trace(`connection from ${device} device:${id}, first use:${new Date(ts).toDateString()}`);
    return next();
  };
}