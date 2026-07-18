import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { CCTX_AdmnController as ctrl } from './cctx_admn.controller';
import getCCTX_AdmnUserRouter from './apis/admin';
import getCCTX_AdmnUIRouter from './apis/bull_ui';

import getAuthRouter from "../cctx_auth/auth.router";

import getCCTXMsgChainsRouter from '@apps/cctx_msgs';
import getCCTXTasksRouter from '@apps/cctx_tasks';

const getCCTX_AdmnRouter = () => {
  const CCTX_AdmnRouter = getAuthRouter();
  const CCTX_AdmnUserRouter = getCCTX_AdmnUserRouter();
  const CCTX_AdmnMsgsRouter = getCCTXMsgChainsRouter();
  const CCTX_AdmnTasksRouter = getCCTXTasksRouter();
  const CCTX_AdmnUIRouter = getCCTX_AdmnUIRouter();

  CCTX_AdmnRouter.get("/config",loadV5(ctrl.AppConfig,...PostMiddleware));
  CCTX_AdmnRouter.get("/connect",loadV5(ctrl.AppConnect,...PostMiddleware));

  CCTX_AdmnRouter.use('/msgs',loadV5(AuthJWT(),CCTX_AdmnMsgsRouter));
  CCTX_AdmnRouter.use('/tasks',loadV5(AuthJWT(),CCTX_AdmnTasksRouter));
  CCTX_AdmnRouter.use('/user',loadV5(AuthJWT(),CCTX_AdmnUserRouter));
  
  //CCTX_AdmnRouter.post('/jobs',loadV5(AuthJWT(),ctrl.CreateNotification));
  //CCTX_AdmnRouter.post('/test',loadV5(AuthJWT(),ctrl.CreateNotification));
  CCTX_AdmnRouter.use('/sys/ui',loadV5(CCTX_AdmnUIRouter));
  
  return CCTX_AdmnRouter;
};
export { getCCTX_AdmnRouter };
export default getCCTX_AdmnRouter;