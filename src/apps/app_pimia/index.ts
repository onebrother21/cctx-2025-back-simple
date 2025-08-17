import { Router } from 'express';

import AdminBullUiRouter from './features/admin-bull-ui';
import AuthRouter from './features/auth';
import CaseReportsRouter from './features/cases';
import SubcriptionsRouter from "./features/subscriptions";

import Utils from '../../utils';
import { AuthJWT } from '../../middlewares';

const getPiMiaRouter = (cache:Utils.RedisCache) => {
  const PiMiaRouter = Router();
  PiMiaRouter.use("/auth",AuthRouter(cache));
  PiMiaRouter.use("/system-ui",AdminBullUiRouter(cache));
  PiMiaRouter.use("/cases",[AuthJWT(),CaseReportsRouter(cache)]);
  PiMiaRouter.use("/subs",[AuthJWT(),SubcriptionsRouter(cache)]);
  return PiMiaRouter;
};
export { getPiMiaRouter };
export default getPiMiaRouter;