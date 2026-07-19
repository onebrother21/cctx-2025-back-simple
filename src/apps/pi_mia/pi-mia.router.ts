import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { PIMiaController as ctrl } from './pi-mia.controller';
import { PIMiaEjsController as ctrlEjs } from './pi-mia-ejs.controller';
import { AuthRouter } from "../cctx_auth/auth.router";

import { getPIMiaAdminRouter } from './apis/admin';
import { getPIMiaCasesRouter } from './apis/cases';
import { getPIMiaInvoicesRouter } from './apis/invoices';

import getCCTXMsgChainsRouter from '@apps/cctx_msgs';
import getCCTXTasksRouter from '@apps/cctx_tasks';

import express from 'express';
import path from 'path';

const getPIMiaRouter = () => {
  const PIMiaRouter = AuthRouter();
  const PIMiaAdminRouter = getPIMiaAdminRouter();
  const PIMiaMsgsRouter = getCCTXMsgChainsRouter();
  const PIMiaTasksRouter = getCCTXTasksRouter();

  //cases,invoices,admins
  PIMiaRouter.get("/",loadV5(ctrlEjs.HandleRoute("home")));
  PIMiaRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  PIMiaRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));
  PIMiaRouter.get("/about",loadV5(ctrlEjs.HandleRoute("about")));
  PIMiaRouter.get("/signup",loadV5(ctrlEjs.HandleRoute("signup")));
  PIMiaRouter.get("/verify",loadV5(ctrlEjs.HandleRoute("verify")));
  PIMiaRouter.get("/register",loadV5(ctrlEjs.HandleRoute("register")));
  PIMiaRouter.get("/login",loadV5(ctrlEjs.HandleRoute("login")));

  PIMiaRouter.get('/hm',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("dash")));
  PIMiaRouter.get("/settings",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("settings")));
  PIMiaRouter.get("/analytics",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("analytics")));
  PIMiaRouter.get("/users",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("users")));
  PIMiaRouter.get('/chats',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chats")));
  PIMiaRouter.get('/chats/:chatId',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chat")));
  
  PIMiaRouter.use('/msgs',loadV5(AuthJWT(),PIMiaMsgsRouter));
  PIMiaRouter.use('/tasks',loadV5(AuthJWT(),PIMiaTasksRouter));
  PIMiaRouter.use('/user',loadV5(AuthJWT(),PIMiaAdminRouter));
  
  PIMiaRouter.post('/jobs',loadV5(AuthJWT(),ctrl.CreateNotification));
  PIMiaRouter.post('/test',loadV5(AuthJWT(),ctrl.CreateNotification));
  
  PIMiaRouter.get("/numbers",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("numbers")));
  PIMiaRouter.post('/numbers/gap',loadV5(AuthJWT(),ctrl.runGapFillStrategy,...PostMiddleware));
  PIMiaRouter.post('/numbers/ps',loadV5(AuthJWT(),ctrl.runPSStrategy,...PostMiddleware));
  PIMiaRouter.post('/numbers/sim',loadV5(AuthJWT(),ctrl.runStrategySim,...PostMiddleware));
  PIMiaRouter.post('/numbers/ncr',loadV5(AuthJWT(),ctrl.calcComboProbability,...PostMiddleware));
  
  return PIMiaRouter;
};
export { getPIMiaRouter };
export default getPIMiaRouter;