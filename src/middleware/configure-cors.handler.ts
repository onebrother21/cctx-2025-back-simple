import cors from 'cors';
import { CorsOptions } from "cors";
import Utils from "@utils";

const jwtSecret = process.env.JWT_KEY || "";
const whitelist = JSON.parse(process.env.ORIGINS||"[]");
const corsOptions:CorsOptions = {
  preflightContinue:false,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
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
  const isStaticSite = /vault|sys\/ui|socket.io/.test(req.url);
  const ip_ = req.ip;
  const ip = (ip_ || "").replace(/:/gi,"").replace(/f/gi,"");
  const wl = req.bvars && req.bvars["origins"]?req.bvars["origins"]:whitelist;
  const bl = req.bvars && req.bvars["blacklist"]?req.bvars["blacklist"]:[];
  const origin = req.header("Origin");
  const isBypass = !origin || wl.includes(origin) || isStaticSite;
  const inTheClear = ip && !bl.includes(ip);
  // console.log({origin,ip,isBypass,inTheClear})
  switch(true){
    case isBypass && inTheClear:{
      corsOptions.origin = true;
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