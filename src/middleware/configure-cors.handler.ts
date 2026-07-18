import cors from 'cors';
import { CorsOptions } from "cors";
import Utils from "@utils";

const whitelist = JSON.parse(process.env.WHITELIST||"[]");
const corsOptions:CorsOptions = {
  preflightContinue:false,
  methods: ['PUT', 'POST', 'DELETE','OPTIONS'],
  optionsSuccessStatus: 200,
  credentials: true,
  exposedHeaders:[],
  allowedHeaders:[
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-csrf-token',
    'x-cctx-e2e',
    'X-AppClient',
    'Access-Control-Allow-Origin',
    "Access-Control-Allow-Credentials",
    'Origin',
    'Accept'
  ]
};
const corsValidator = (origin:string|undefined, next:Function) => {
  console.log(origin);
  const e = new Utils.AppError(403,"Request not allowed");
  return whitelist.includes(origin || "")?next(null,true):next(e,false);
};
export const corsOptionsDelegate = function (req:IRequest, callback:Function) {
  const method = req.method.toLocaleUpperCase();
  const url = req.url;
  const isStaticSite = /vault|sys\/ui|socket.io/.test(url);
  const ip_ = req.ip;
  const ip = (ip_ || "").replace(/:/gi,"").replace(/f/gi,"");
  const wl = req.svars && req.svars["origins"]?req.svars["origins"]:whitelist;
  const bl = req.svars && req.svars["blacklist"]?req.svars["blacklist"]:[];
  const origin = req.header("Origin");
  const isBypass = !origin || wl.includes(origin) || isStaticSite;
  const inTheClear = ip && !bl.includes(ip);
  // Utils.ok("cors-info",{method,url,origin,ip,isBypass,inTheClear});

  switch(true){
    case isBypass && inTheClear:{
      corsOptions.origin = true;
      corsOptions.credentials = true;
      return callback(null,corsOptions);
    }
    default:{
      corsOptions.origin = false;
      const e = new Utils.AppError(403,"Request not allowed");
      return callback(e,corsOptions);
    }
  }
}

export const ConfigureCors:() => IHandler = () => cors(corsOptionsDelegate);
export default ConfigureCors;