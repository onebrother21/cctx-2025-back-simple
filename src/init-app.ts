import express, { ErrorRequestHandler, Express, RequestHandler } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';

import { RedisCache } from './init-cache';
import localize from './init-localization';
import {
  AuthJWT,
  PageNotFound,
  SendErrorHandler,
  ConfigureCors,
  ConfigureSession,
  SetBusinessVars,
  SetUserDevice,
  SetCsrfToken,
  ValidateCsrfToken,
  PruneBody,
  DecryptData,
  headerCheck,
  cookieCheck,
  sessionCheck,
  upload,
} from "@middleware";
import Utils from '@utils';

import getAppPublicRouter from './init-app-public.router';

import getGlassRouter from './apps/glass';
import getVaultRouter from './apps/vault';
import getCCTXAuthRouter from './apps/cctx_auth';
import getCCTXTasksRouter from "./apps/cctx_tasks";
import getCCTXMsgChainsRouter from "./apps/cctx_msgs";
import getCCTXAdminRouter from './apps/cctx_admn';
import getCCTXDevAdminRouter from './apps/cctx_dev/admn';
import getDegenPokerRouter from "./apps/jpmoney/degen_poker";
import getPiMiaRouter from './apps/pi_mia';
import getPingRouter from './apps/ping';
//import getUpcentricRouter from './apps/upcentric';
//import getCrashDepotRouter from '../apps/app_crashdepot';


const cookieSecret = process.env.COOKIE_SECRET || 'myCookieSecret';

export const initApp = (app:Express,cache:RedisCache) => {
  const isProd = Utils.isProd();
  // COMPRESSION, MORGAN, VIEWS & STATIC
  app.use(compression());
  app.use(morgan('dev', {
    skip: function (req, res) {
      return "HEAD" == req.method || "OPTIONS"  == req.method && res.statusCode == 200;
    }
  }));
  const publicPath = `${isProd?'../../':'../'}public`;
  const viewPath = `${isProd?'../../':'../'}views`;
  app.set('view engine','ejs');
  app.set('views',path.join(__dirname,viewPath));
  app.use(express.static(path.join(__dirname,publicPath)));

  // BUSINESS VARS
  app.use(SetBusinessVars(cache) as RequestHandler);

  // CORS
  app.use(ConfigureCors() as RequestHandler);

  // trust first proxy in prod
  //if(Utils.isProd()) {app.set('trust proxy',1);} 
  // COOKIES
  app.use(cookieParser(cookieSecret));
  // app.use(cookieCheck() as RequestHandler);

  // SESSION
  app.use(ConfigureSession() as RequestHandler);
  // app.use(sessionCheck() as RequestHandler);
  // CSRF
  app.use(ValidateCsrfToken() as RequestHandler);
  app.use(SetCsrfToken() as RequestHandler);
  // app.use(headerCheck() as RequestHandler);

  //LOCALIZE REQ
  //localize(app);
  
  //PARSE BODY & DECRYPT
  app.use(express.urlencoded({extended:true}));
  app.use(express.json());
  app.use(DecryptData() as RequestHandler);
  app.use(PruneBody() as RequestHandler);
  app.use(SetUserDevice() as RequestHandler);
  
  // APIS
  app.use("/",getAppPublicRouter());
  app.use("/glass",getGlassRouter());
  app.use("/vault",getVaultRouter());
  
  app.use("/av3/cctx/auth",getCCTXAuthRouter());
  app.use("/av3/cctx/admn",getCCTXAdminRouter());
  app.use("/av3/cctx_dev/admn",getCCTXDevAdminRouter());
  app.use("/av3/cctx/msgs",[AuthJWT(),getCCTXMsgChainsRouter()] as RequestHandler[]);
  app.use("/av3/cctx/tasks",[AuthJWT(),getCCTXTasksRouter()] as RequestHandler[]);

  app.use("/av3/jpmoney/degen_poker",getDegenPokerRouter());
  app.use("/av3/pi_mia",getPiMiaRouter());
  app.use("/av3/ping",getPingRouter());

  app.use('/*splat',PageNotFound() as RequestHandler);
  app.use(SendErrorHandler() as ErrorRequestHandler);
};
export default initApp;