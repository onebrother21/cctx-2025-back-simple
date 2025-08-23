import { Router } from 'express';


import AdminBullUiRouter from './features/admin-bull-ui';
import CrashReportsRouter from './features/crash-reports';
import SubcriptionsRouter from "./features/subscriptions";

import Utils from '../../utils';
import { AuthJWT } from '../../middlewares';

const getCrashDepotRouter = (cache:Utils.RedisCache) => {
  const CrashDepotRouter = Router();
  CrashDepotRouter.use("/ui",AdminBullUiRouter(cache));
  CrashDepotRouter.use("/reports",CrashReportsRouter(cache));
  CrashDepotRouter.use("/subs",[AuthJWT(),SubcriptionsRouter(cache)])
  return CrashDepotRouter;
};
export { getCrashDepotRouter };
export default getCrashDepotRouter;