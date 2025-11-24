import { Router } from 'express';
import { DegenSessionsController as ctrl } from './sessions.controller';
import { DegenSessionsValidators as validators } from './sessions.validators';
import { PostMiddleware,upload } from '../../../../../middlewares';
import Utils from '../../../../../utils';

const DegenSessionsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 DegenSession Queries
  router.get("/q",[ctrl.queryDegenSessions,...PostMiddleware]);
  //router.post("/many",[ctrl.createDegenSessions,...PostMiddleware]);
  router.post("/",[...validators.createDegenSession,ctrl.createDegenSession,...PostMiddleware]);
  router.get("/:sessionId",[ctrl.getDegenSessionById,...PostMiddleware]);
  router.put("/:sessionId",[...validators.updateDegenSession, ctrl.updateDegenSession,...PostMiddleware]);
  router.delete("/:sessionId",[ctrl.deleteDegenSession,...PostMiddleware]);
  router.put("/:sessionId/status",[...validators.updateDegenSessionStatus, ctrl.updateDegenSessionStatus,...PostMiddleware]);
  router.post("/:sessionId/start",[ctrl.finalizeDegenSession,...PostMiddleware]);
  router.post("/:sessionId/end",[ctrl.closeDegenSession,...PostMiddleware]);

  return router;
};
export { DegenSessionsRouter };
export default DegenSessionsRouter;