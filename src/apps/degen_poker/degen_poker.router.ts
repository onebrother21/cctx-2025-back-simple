import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { DegenPokerController as ctrl } from './degen_poker.controller';
import { DegenPokerEjsController as ctrlEjs } from './degen_poker-ejs.controller';
import { AuthRouter } from "../cctx_auth/auth.router";

import { DegenPlayersRouter } from './apis/players';
import { DegenAdminRouter } from './apis/admin';
import { DegenSessionsRouter } from './apis/sessions';
import { DegenVenuesRouter } from './apis/venues';

import getCCTXMsgChainsRouter from '@apps/cctx_msgs';
import getCCTXTasksRouter from '@apps/cctx_tasks';

import express from 'express';
import path from 'path';

const getDegenPokerRouter = () => {
  const DegenPokerRouter = AuthRouter();
  const playersRouter = DegenPlayersRouter();
  const adminRouter = DegenAdminRouter();
  const sessionsRouter = DegenSessionsRouter();
  const venuesRouter = DegenVenuesRouter();

  const DegenPokerMsgsRouter = getCCTXMsgChainsRouter();
  const DegenPokerTasksRouter = getCCTXTasksRouter();

  DegenPokerRouter.get("/",loadV5(ctrlEjs.HandleRoute("home")));
  DegenPokerRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  DegenPokerRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));
  DegenPokerRouter.get("/about",loadV5(ctrlEjs.HandleRoute("about")));
  DegenPokerRouter.get("/signup",loadV5(ctrlEjs.HandleRoute("signup")));
  DegenPokerRouter.get("/verify",loadV5(ctrlEjs.HandleRoute("verify")));
  DegenPokerRouter.get("/register",loadV5(ctrlEjs.HandleRoute("register")));
  DegenPokerRouter.get("/login",loadV5(ctrlEjs.HandleRoute("login")));

  DegenPokerRouter.get('/hm',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("dash")));
  DegenPokerRouter.get("/settings",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("settings")));
  DegenPokerRouter.get("/analytics",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("analytics")));
  DegenPokerRouter.get("/users",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("users")));
  DegenPokerRouter.get('/chats',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chats")));
  DegenPokerRouter.get('/chats/:chatId',loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("chat")));
  
  DegenPokerRouter.use('/msgs',loadV5(AuthJWT(),DegenPokerMsgsRouter));
  DegenPokerRouter.use('/tasks',loadV5(AuthJWT(),DegenPokerTasksRouter));
  DegenPokerRouter.use('/players',loadV5(AuthJWT(),playersRouter));
  DegenPokerRouter.use('/admin',loadV5(AuthJWT(),adminRouter));
  DegenPokerRouter.use('/sessions',loadV5(AuthJWT(),sessionsRouter));
  DegenPokerRouter.use('/venues',loadV5(AuthJWT(),venuesRouter));
  
  DegenPokerRouter.post('/jobs',loadV5(AuthJWT(),ctrl.CreateNotification));
  DegenPokerRouter.post('/test',loadV5(AuthJWT(),ctrl.CreateNotification));
  
  DegenPokerRouter.get("/numbers",loadV5(ctrlEjs.CheckLogin,ctrlEjs.HandleRoute("numbers")));
  DegenPokerRouter.post('/numbers/gap',loadV5(AuthJWT(),ctrl.runGapFillStrategy,...PostMiddleware));
  DegenPokerRouter.post('/numbers/ps',loadV5(AuthJWT(),ctrl.runPSStrategy,...PostMiddleware));
  DegenPokerRouter.post('/numbers/sim',loadV5(AuthJWT(),ctrl.runStrategySim,...PostMiddleware));
  DegenPokerRouter.post('/numbers/ncr',loadV5(AuthJWT(),ctrl.calcComboProbability,...PostMiddleware));
  
  return DegenPokerRouter;
};
export { getDegenPokerRouter };
export default getDegenPokerRouter;