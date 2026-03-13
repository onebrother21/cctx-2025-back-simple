import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';
import path from 'path';

import RedisCache from './init-cache';
import localize from './init-localization';
import {
  AuthJWT,
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
  PruneBody,
  sessionOpts,
  corsOptionsDelegate,
  upload,
} from "@middleware";

import getAppPublicRouter from './init-app-public.router';

import getTasksRouter from "./modules/tasks";
import getCCTXAuthRouter from './apps/cctx_auth';
import getCCTXAdminRouter from './apps/cctx_admn';
import getDegenPokerRouter from "./apps/jpmoney/degen_poker";
import getPiMiaRouter from './apps/pi_mia';
import getPingRouter from './apps/ping';
//import getUpcentricRouter from './apps/upcentric';
//import getCrashDepotRouter from '../apps/app_crashdepot';

import Utils from '@utils';

const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';

export class App {
  static init = (app:Express,cache:RedisCache) => {
    // COMPRESSION, MORGAN, VIEWS & STATIC
    app.use(compression());
    app.use(morgan('dev', {
      skip: function (req, res) {
        return req.method === 'OPTIONS' && res.statusCode == 200;
      }
    }));
    app.set('view engine','ejs');
    app.set('views',path.join(__dirname,'../views'));
    app.use(express.static(path.join(__dirname,'../public')));

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
    // SESSION
    app.use(session(sessionOpts));
    // app.use(headerCheck);

    //LOCALIZE REQ
    //localize(app);
    
    //PARSE BODY & DECRYPT
    app.use(express.urlencoded({extended:true}));
    app.use(express.json());
    app.use(DecryptData());
    app.use(PruneBody());
    app.use(SetUserDevice());
    
    // APIS
    app.use("/",getAppPublicRouter());
    app.use("/av3/cctx/auth",getCCTXAuthRouter());
    app.use("/av3/cctx/admn",getCCTXAdminRouter());
    app.use("/av3/cctx/tasks",[AuthJWT(),getTasksRouter()]);
    app.use("/av3/jpmoney/degen_poker",getDegenPokerRouter());
    app.use("/av3/pi_mia",getPiMiaRouter());
    app.use("/av3/ping",getPingRouter());

    app.use("**",PageNotFound());
    app.use(SendErrorHandler());
  };
}
export default App;