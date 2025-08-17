import { Router } from 'express';
import { FinancialLineItemsController as ctrl } from './line-items.controller';
import { FinancialLineItemsValidators as validators } from './line-items.validators';
import { PostMiddleware,upload } from '../../../../middlewares';
import Utils from '../../../../utils';

const FinancialLineItemsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 FinancialLineItem Queries
  router.get("/q",[ctrl.queryFinancialLineItems,...PostMiddleware]);
  router.post("/",[...validators.createFinancialLineItem,ctrl.createFinancialLineItem,...PostMiddleware]);
  router.get("/:itemId",[ctrl.getFinancialLineItemById,...PostMiddleware]);
  router.put("/:itemId",[...validators.updateFinancialLineItem, ctrl.updateFinancialLineItem,...PostMiddleware]);
  router.delete("/:itemId",[ctrl.deleteFinancialLineItem,...PostMiddleware]);

  return router;
};
export { FinancialLineItemsRouter };
export default FinancialLineItemsRouter;