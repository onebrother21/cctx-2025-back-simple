import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { GlassController as ctrl } from './glass.controller';
import { GlassEjsController as ctrlEjs } from './glass-ejs.controller';
import { AuthRouter } from "../cctx_auth/auth.router";
import { getGlassUserRouter } from './user';

import getCCTXMsgChainsRouter from '@apps/cctx_msgs';
import getCCTXTasksRouter from '@apps/cctx_tasks';

const getGlassRouter = () => {
  const GlassRouter = AuthRouter();
  const GlassUserRouter = getGlassUserRouter();
  const GlassMsgsRouter = getCCTXMsgChainsRouter();
  const GlassTasksRouter = getCCTXTasksRouter();

  GlassRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  GlassRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));

  GlassRouter.use('/msgs',loadV5(AuthJWT(),GlassMsgsRouter));
  GlassRouter.use('/tasks',loadV5(AuthJWT(),GlassTasksRouter));
  GlassRouter.use('/user',loadV5(AuthJWT(),GlassUserRouter));
  
  GlassRouter.post('/jobs',loadV5(AuthJWT(),ctrl.CreateNotification));
  GlassRouter.post('/test',loadV5(AuthJWT(),ctrl.CreateNotification));
  
  GlassRouter.get("/about",loadV5(ctrlEjs.RenderAbout));
  GlassRouter.get("/signup",loadV5(ctrlEjs.RenderSignup));
  GlassRouter.get("/verify",loadV5(ctrlEjs.RenderVerify));
  GlassRouter.get("/register",loadV5(ctrlEjs.RenderRegister));
  GlassRouter.get("/login",loadV5(ctrlEjs.RenderLogin));
  GlassRouter.get('/hm',loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderDash));
  GlassRouter.get("/settings",loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderSettings));
  GlassRouter.get("/analytics",loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderAnalytics));
  GlassRouter.get("/users",loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderUsers));
  GlassRouter.get('/chats',loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderChats));
  GlassRouter.get('/chats/:chatId',loadV5(ctrlEjs.CheckLogin,ctrlEjs.RenderChat));
  
  return GlassRouter;
};
export { getGlassRouter };
export default getGlassRouter;