
import { Router } from 'express';
import { DegenSessionsController as ctrl } from './sessions.controller';
import { DegenSessionsValidators as validators } from './sessions.validators';
import { PostMiddleware,upload } from '@middleware';

const DegenSessionsRouter = () => {
  const router = Router();
  
  // 📌 DegenSession Queries
  router.get("/q",[ctrl.querySessions,...PostMiddleware]);
  router.get("/desc/q",[ctrl.queryDescriptions,...PostMiddleware]);
  //router.post("/many",[ctrl.createSessions,...PostMiddleware]);
  router.post("/",[...validators.createSession,ctrl.createSession,...PostMiddleware]);
  router.get("/:sessionId",[ctrl.getSessionById,...PostMiddleware]);
  router.put("/:sessionId",[...validators.updateSession, ctrl.updateSession,...PostMiddleware]);
  router.delete("/:sessionId",[ctrl.deleteSession,...PostMiddleware]);

  router.put("/:sessionId/update/status",[ctrl.updateSessionStatus,...PostMiddleware]);
  router.post("/:sessionId/update/:updateType",[ctrl.addUpdateToSession,...PostMiddleware]);
  router.delete("/:sessionId/update/:updateType/:itemIdx",[ctrl.removeUpdateToSession,...PostMiddleware]);

  router.post("/:sessionId/start",[ctrl.finalizeSession,...PostMiddleware]);
  router.post("/:sessionId/end",[ctrl.closeSession,...PostMiddleware]);

  return router;
};
export { DegenSessionsRouter };
export default DegenSessionsRouter;