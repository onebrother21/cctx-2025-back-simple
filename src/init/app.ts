import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';
import path from 'path';

import localize from './localization';
import {
  PageNotFound,
  SendErrorHandler,
  SetResponseCorsHeaders,
  SetBusinessVars,
  SetUserDevice,
  SetCsrfToken,
  doubleCsrfUtils,
  DecryptData,
  headerCheck,
  cookieCheck,

  sessionOpts,
  corsOptionsDelegate,
  upload,
} from "../middlewares";
import Utils from "../utils";

import {getAppPublicRouter,getApiConnectionRouter} from '../apps/cctx_public';
import getAuthRouter from '../apps/cctx_auth';
//import getPiMiaRouter from '../apps/app_pimia';
//import getCrashDepotRouter from '../apps/app_crashdepot';
//import getECSRouter from '../apps/app_ecs';
import getUpcentricRouter from '../apps/upcentric';

const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';

export default (app:Express,cache:Utils.RedisCache) => {
  // COMPRESSION, MORGAN, VIEWS & STATIC
  app.use(compression());
  app.use(morgan('dev', {
    skip: function (req, res) {
      return req.method === 'OPTIONS' && res.statusCode == 200;
    }
  }));
  app.set('views',path.join(__dirname,'../../views'));
  app.set('view engine','ejs');
  app.use(express.static(path.join(__dirname,'../../public')));

  // BUSINESS VARS
  app.use(SetBusinessVars(cache));
  // CORS
  app.use(cors(corsOptionsDelegate));
  // COOKIES
  app.use(cookieParser(cookieSecret));
  if(app.get('env') === 'production') {
    app.set('trust proxy',1) // trust first proxy
    sessionOpts.cookie.secure = true // serve secure cookies
  }
  // app.use(cookieCheck());
  // CSRF
  app.use(doubleCsrfUtils.doubleCsrfProtection);
  app.use(SetCsrfToken());
  // SESSION & DEVICE
  app.use(session(sessionOpts));
  app.use(SetUserDevice());
  // app.use(headerCheck);
  
  // PUBLIC API
  app.use('/',getAppPublicRouter(cache));
  //localize(app);
  app.use(express.urlencoded({extended:true}));
  app.post("/av3/uploads",upload.single('file'),[(req:any,res:any) => {
    console.log(req.file);
    res.json({success:true,msg:"ok"});
  }]);
  
  app.use(express.json());
  app.use(DecryptData());
  //app.use("/av3/pi-mia",getPiMiaRouter(cache));
  //app.use("/av3/ecs",getECSRouter(cache));
  app.use("/av3/auth",getAuthRouter(cache));
  app.use("/av3/upcentric",getUpcentricRouter(cache));

  app.use("**",PageNotFound());
  app.use(SendErrorHandler());
};