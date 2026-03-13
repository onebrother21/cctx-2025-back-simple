import { Router } from 'express';
import { DegenSessionsController as ctrl } from './sessions.controller';
import { DegenSessionsValidators as validators } from './sessions.validators';
import { PostMiddleware,upload } from '@middleware';

const DegenSessionsRouter = () => {
  const router = Router();
  
  // 📌 DegenSession Queries
  router.get("/q",[ctrl.queryDegenSessions,...PostMiddleware]);
  router.get("/desc/q",[ctrl.queryDegenSessionDescriptions,...PostMiddleware]);
  //router.post("/many",[ctrl.createDegenSessions,...PostMiddleware]);
  router.post("/",[...validators.createDegenSession,ctrl.createDegenSession,...PostMiddleware]);
  router.get("/:sessionId",[ctrl.getDegenSessionById,...PostMiddleware]);
  router.put("/:sessionId",[...validators.updateDegenSession, ctrl.updateDegenSession,...PostMiddleware]);
  router.delete("/:sessionId",[ctrl.deleteDegenSession,...PostMiddleware]);

  router.put("/:sessionId/update/status",[ctrl.updateDegenSessionStatus,...PostMiddleware]);
  router.post("/:sessionId/update/:updateType",[ctrl.addUpdateToDegenSession,...PostMiddleware]);
  router.delete("/:sessionId/update/:updateType/:itemIdx",[ctrl.removeUpdateToDegenSession,...PostMiddleware]);

  router.post("/:sessionId/start",[ctrl.finalizeDegenSession,...PostMiddleware]);
  router.post("/:sessionId/end",[ctrl.closeDegenSession,...PostMiddleware]);

  return router;
};
export { DegenSessionsRouter };
export default DegenSessionsRouter;