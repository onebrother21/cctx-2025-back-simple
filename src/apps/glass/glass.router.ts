import { AuthJWT, loadV5,PostMiddleware } from '@middleware';
import { GlassController as ctrl } from './glass.controller';
import { getGlassUserRouter } from './user';
import { AuthRouter } from "../cctx_auth/auth.router";

const getGlassRouter = () => {
  const GlassRouter = AuthRouter();
  const GlassUserRouter = getGlassUserRouter();
  GlassRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  GlassRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));
  GlassRouter.get("/about",loadV5(ctrl.RenderAbout));

  GlassRouter.get("/signup",loadV5(ctrl.RenderSignup));
  GlassRouter.get("/verify",loadV5(ctrl.RenderVerify));
  GlassRouter.get("/register",loadV5(ctrl.RenderRegister));
  GlassRouter.get("/login",loadV5(ctrl.RenderLogin));

  GlassRouter.get('/hm',loadV5(ctrl.CheckLogin,ctrl.RenderDash));
  GlassRouter.get("/settings",loadV5(ctrl.CheckLogin,ctrl.RenderSettings));
  GlassRouter.get("/users",loadV5(ctrl.CheckLogin,ctrl.RenderUsers));
  GlassRouter.get("/analytics",loadV5(ctrl.CheckLogin,ctrl.RenderAnalytics));
  GlassRouter.get('/chats',loadV5(ctrl.CheckLogin,ctrl.RenderChats));
  GlassRouter.get('/chats/:chatId',loadV5(ctrl.CheckLogin,ctrl.RenderChat));

  GlassRouter.use('/user',loadV5(AuthJWT(),GlassUserRouter));
  GlassRouter.post('/jobs',loadV5(ctrl.CheckLogin,ctrl.CreateNotification));
  GlassRouter.post('/test',loadV5(ctrl.CheckLogin,ctrl.CreateNotification));
  
  return GlassRouter;
};
export { getGlassRouter };
export default getGlassRouter;