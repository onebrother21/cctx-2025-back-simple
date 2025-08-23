import { Router } from 'express';

import AdminBullUiRouter from './features/admin-bull-ui';
import AuthRouter from './features/auth';
import DistrictLeadsRouter from './features/district-leads';
import FinancialLineItemRouter from './features/line-items';

import Utils from '../../utils';
import { AuthJWT } from '../../middlewares';

const getECSRouter = (cache:Utils.RedisCache) => {
  const ECSRouter = Router();
  ECSRouter.use("/auth",AuthRouter(cache));
  ECSRouter.use("/sys/ui",AdminBullUiRouter(cache));
  ECSRouter.use("/leads",[AuthJWT(),DistrictLeadsRouter(cache)]);
  ECSRouter.use("/fin/budget-items",[AuthJWT(),FinancialLineItemRouter(cache)]);
  ECSRouter.use("/fin/expenses",[AuthJWT(),FinancialLineItemRouter(cache)]);
  return ECSRouter;
};
export { getECSRouter };
export default getECSRouter;