import { Router } from 'express';
import { SubscriptionsController as ctrl } from './subscriptions.controller';
import { SubscriptionsValidators as validators } from './subscriptions.validators';

import { PostMiddleware } from '../../../../middlewares';
import Utils from '../../../../utils';

const SubscriptionsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 Subscription & Fulfillment
  router.post("/",[
    ...validators.createSubscription,
    ctrl.createSubscription,
    ...PostMiddleware
  ]);
  router.get("/:planId",[ctrl.getSubscriptionById,...PostMiddleware]);
  router.put(":/planId/status",[...validators.updateSubscriptionStatus, ctrl.updateSubscriptionStatus,...PostMiddleware]);
  router.put("/:planId",[...validators.updateSubscription, ctrl.updateSubscription,...PostMiddleware]);

  return router;
};
export { SubscriptionsRouter };
export default SubscriptionsRouter;