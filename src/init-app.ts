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


import getCCTXAuthRouter from './apps/cctx_auth';
import getCCTXTasksRouter from "./apps/cctx_tasks";
import getCCTXMsgChainsRouter from "./apps/cctx_msgs";
import getCCTXAdmnRouter from './apps/cctx_admn';
import getGlassRouter from './apps/glass';
import getDegenPokerRouter from "./apps/degen_poker";
import getPIMiaRouter from './apps/pi_mia';
import getVaultRouter from './apps/_dev/vault';
//import getPingRouter from './apps/ping';
//import getCrashDepotRouter from '../apps/app_crashdepot';

const cookieSecret = Utils.getVar("COOKIE_SECRET") || 'myCookieSecret';
const authSecret = Utils.getVar("AUTH_SECRET") || 'authSecret';
const deviceSecret = Utils.getVar("DEVICE_SECRET") || 'deviceSecret';
const sessionSecret = Utils.getVar("SESSION_SECRET") || 'sessionSecret';
const csrfSecret = Utils.getVar("CSRF_SECRET") || 'csrfSecret';

export const initApp = (cache:RedisCache) => {
  const isProd = Utils.isProd();
  const app = express();
  // COMPRESSION, MORGAN, VIEWS & STATIC
  app.use(compression());
  app.use(morgan('dev', {
    skip: function (req, res) {
      return "HEAD" == req.method || "OPTIONS"  == req.method && res.statusCode == 200;
    }
  }));
  
  app.set('view engine','ejs');
  app.set('views',[
    path.join(__dirname,'../views'),
    path.join(__dirname,'apps/glass/views'),
  ]);
  app.use(express.static(path.join(__dirname,'../public')));
  app.use("/glass/assets",express.static(path.join(__dirname,'apps/glass/assets')));

  // BUSINESS VARS
  app.use(SetBusinessVars(cache) as RequestHandler);
  // CORS
  app.use(ConfigureCors() as RequestHandler);

  // COOKIES
  if(Utils.isProd()) app.set('trust proxy',1);
  app.use(cookieParser([
    cookieSecret,
    authSecret,
    deviceSecret,
    sessionSecret,
    csrfSecret,
  ]));
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
  app.use("/cctx/admn",getCCTXAdmnRouter());
  
  app.use("/cctx/auth",getCCTXAuthRouter());
  app.use("/cctx/msgs",[AuthJWT(),getCCTXMsgChainsRouter()] as RequestHandler[]);
  app.use("/cctx/tasks",[AuthJWT(),getCCTXTasksRouter()] as RequestHandler[]);

  //app.use("/degen_poker",getDegenPokerRouter());
  //app.use("/pi_mia",getPiMiaRouter());
  //app.use("/av3/ping",getPingRouter());

  app.use('/*splat',PageNotFound() as RequestHandler);
  app.use(SendErrorHandler() as ErrorRequestHandler);
  return app;
};
export default initApp;