import { Router } from 'express';
import { TradingPlanMgmtController as ctrl } from './trading-plans.controller';
import { TradingPlanMgmtValidators as validators } from './trading-plans.validators';
import { PostMiddleware } from '../../../../middlewares';
import Utils from '../../../../utils';

const TradingPlanMgmtRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 TradingPlan & Fulfillment
  router.post("/",[
    ...validators.createTradingPlan,
    ctrl.createTradingPlan,
    ...PostMiddleware
  ]);
  router.get("/:planId",[ctrl.getTradingPlanById,...PostMiddleware]);
  router.put(":/planId/status",[...validators.updateTradingPlanStatus, ctrl.updateTradingPlanStatus,...PostMiddleware]);
  router.put("/:planId",[...validators.updateTradingPlan, ctrl.updateTradingPlan,...PostMiddleware]);

  return router;
};
export { TradingPlanMgmtRouter };
export default TradingPlanMgmtRouter;