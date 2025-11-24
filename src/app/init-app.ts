import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';
import path from 'path';

import localize from './init-localization';
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

import getAppPublicRouter from './init-app-public.router';
import getAuthRouter from '../apps/cctx_auth';
import getAdminUIRouter from '../apps/cctx_admin/bull_ui';
//import getPiMiaRouter from '../apps/app_pimia';
//import getCrashDepotRouter from '../apps/app_crashdepot';
//import getECSRouter from '../apps/app_ecs';
import getUpcentricRouter from '../apps/upcentric';
import getDegenPokerRouter from "../apps/jpmoney/degen_poker";

import Utils from '../utils';

const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';

export class App {
  static init = (app:Express,cache:Utils.RedisCache) => {
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
    //localize(app);
    app.use(express.urlencoded({extended:true}));
  
    app.use(express.json());
    app.use(DecryptData());
    app.use("/",getAppPublicRouter(cache));
    app.use("/av3/cctx/auth",getAuthRouter(cache));
    app.use("/av3/cctx/sys/ui",getAdminUIRouter());
    app.use("/av3/jpmoney/degen_poker",getDegenPokerRouter(cache));
    //app.use("/av3/upcentric",getUpcentricRouter(cache));
    //app.use("/av3/pi-mia",getPiMiaRouter(cache));
    //app.use("/av3/ecs",getECSRouter(cache));

    app.use("**",PageNotFound());
    app.use(SendErrorHandler());
  };
}
export default App;