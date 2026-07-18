import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { GlassController as ctrl } from './glass.controller';
import { GlassEjsController as ctrlEjs } from './glass-ejs.controller';
import { AuthRouter } from "../cctx_auth/auth.router";
import { getGlassUserRouter } from './user';

import getCCTXMsgChainsRouter from '@apps/cctx_msgs';
import getCCTXTasksRouter from '@apps/cctx_tasks';

import express from 'express';
import path from 'path';

const getGlassRouter = () => {
  const GlassRouter = AuthRouter();
  const GlassUserRouter = getGlassUserRouter();
  const GlassMsgsRouter = getCCTXMsgChainsRouter();
  const GlassTasksRouter = getCCTXTasksRouter();

  GlassRouter.get("/",loadV5(ctrlEjs.HandleRoute("home")));
  GlassRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  GlassRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));
  GlassRouter.get("/about",loadV5(ctrlEjs.HandleRoute("about")));
  GlassRouter.get("/signup",loadV5(ctrlEjs.HandleRoute("signup")));
  GlassRouter.get("/verify",loadV5(ctrlEjs.HandleRoute("verify")));
  GlassRouter.get("/register",loadV5(ctrlEjs.HandleRoute("register")));
  GlassRouter.get("/login",loadV5(ctrlEjs.HandleRoute("login")));

  GlassRouter.get('/hm',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("dash")));
  GlassRouter.get("/settings",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("settings")));
  GlassRouter.get("/analytics",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("analytics")));
  GlassRouter.get("/users",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("users")));
  GlassRouter.get('/chats',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chats")));
  GlassRouter.get('/chats/:chatId',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chat")));
  
  GlassRouter.use('/msgs',loadV5(AuthJWT(),GlassMsgsRouter));
  GlassRouter.use('/tasks',loadV5(AuthJWT(),GlassTasksRouter));
  GlassRouter.use('/user',loadV5(AuthJWT(),GlassUserRouter));
  
  GlassRouter.post('/jobs',loadV5(AuthJWT(),ctrl.CreateNotification));
  GlassRouter.post('/test',loadV5(AuthJWT(),ctrl.CreateNotification));
  
  GlassRouter.get("/numbers",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("numbers")));
  GlassRouter.post('/numbers/gap',loadV5(AuthJWT(),ctrl.runGapFillStrategy,...PostMiddleware));
  GlassRouter.post('/numbers/ps',loadV5(AuthJWT(),ctrl.runPSStrategy,...PostMiddleware));
  GlassRouter.post('/numbers/sim',loadV5(AuthJWT(),ctrl.runStrategySim,...PostMiddleware));
  GlassRouter.post('/numbers/ncr',loadV5(AuthJWT(),ctrl.calcComboProbability,...PostMiddleware));
  
  return GlassRouter;
};
export { getGlassRouter };
export default getGlassRouter;