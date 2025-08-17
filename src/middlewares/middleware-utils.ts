import { CorsOptions } from "cors";
import { SessionOptions } from 'express-session';
import MongoStore from 'connect-mongo';
import multer from "multer";
import path from "path";

import Utils from "../utils";

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
/** Assumes that no-origin requests are web requests for server pages only */
const corsOptionsDelegate = function (req:IRequest, callback:Function) {
  //console.log("starting cors",req.header("Origin"))
  const isBullUIRoute = /sys\/ui/.test(req.url);
  const isApiRoute = /av3/.test(req.url);
  const ip = req.ip.replace(/:/gi,"").replace(/f/gi,"");
  const wl = req.bvars && req.bvars["origins"]?req.bvars["origins"]:whitelist;
  const bl = req.bvars && req.bvars["blacklist"]?req.bvars["blacklist"]:[];
  const origin = req.header("Origin");
  const isBypass = !origin && isBullUIRoute;
  const inTheClear = wl.includes(origin) && !bl.includes(ip);
  //console.log({origin,isBypass,inTheClear})
  switch(true){
    case isBypass:
    case inTheClear:{
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

// MORGAN
const morganOutputTemplate = ':method :url :status [:remote-addr :user-agent :date[iso]]';
//':res[content-length] - :response-time ms'

// COOKIES & SESSIONS
const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';
const sessionCookieOpts = {
  httpOnly:false,
  maxAge:30 * 60 * 1000,
}
const mongoStore = MongoStore.create({
  collectionName:"ultimate-sessions",
  dbName:process.env.DB_NAME,
  mongoUrl:process.env.DB,
  autoRemove: 'interval',
  autoRemoveInterval: 30 // In minutes
});
const sessionOpts:SessionOptions = {
  name:"my-ultimate-session",
  secret:cookieSecret,
  saveUninitialized:false,
  resave:false,
  cookie:{
    sameSite:"strict",
    path: '/',
    secure:process.env.NODE_ENV === 'production',
    httpOnly:true,
    maxAge:30 * 60 * 1000,
  },
  store:mongoStore,
};

// MULTER & UPLOADS
const storage = multer.diskStorage({
  destination:(req,file,cb) => {
    const dir = path.join(__dirname, '../../../uploads');
    cb(null,dir);
  },
  filename:(req,file,cb)=>{
    cb(null, Date.now()+'-'+file.originalname);
  }
});
const upload = multer({storage}); // temporary local storage
const uploadFields = [
  "type",
  "asset_folder",
  "original_filename",
  "original_date",
  "location",
  "description",
  "format",
  "resource_type",
  "bytes",
  "secure_url",
  "public_id",
  "created_at",
];

export {
  corsValidator,
  corsOptionsDelegate,
  morganOutputTemplate,
  sessionOpts,
  upload,
  uploadFields,
};