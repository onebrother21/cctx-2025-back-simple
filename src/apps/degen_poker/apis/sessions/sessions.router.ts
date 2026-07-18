import { Router } from 'express';
import { DegenSessionsController as ctrl } from './sessions.controller';
import { DegenSessionsValidators as validators } from './sessions.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';

const DegenSessionsRouter = () => {
  const router = Router();
  
  // 📌 DegenSession Queries
  router.get("/q",loadV5(ctrl.querySessions,...PostMiddleware));
  router.get("/desc/q",loadV5(ctrl.queryDescriptions,...PostMiddleware));
  //router.post("/many",loadV5(ctrl.createSessions,...PostMiddleware));
  router.post("/",loadV5(...validators.createSession,ctrl.createSession,...PostMiddleware));
  router.get("/:sessionId",loadV5(ctrl.getSessionById,...PostMiddleware));
  router.put("/:sessionId",loadV5(...validators.updateSession, ctrl.updateSession,...PostMiddleware));
  router.delete("/:sessionId",loadV5(ctrl.deleteSession,...PostMiddleware));

  router.put("/:sessionId/update/status",loadV5(ctrl.updateSessionStatus,...PostMiddleware));
  router.post("/:sessionId/update/:updateType",loadV5(ctrl.addUpdateToSession,...PostMiddleware));
  router.delete("/:sessionId/update/:updateType/:itemIdx",loadV5(ctrl.removeUpdateToSession,...PostMiddleware));

  router.post("/:sessionId/start",loadV5(ctrl.finalizeSession,...PostMiddleware));
  router.post("/:sessionId/end",loadV5(ctrl.closeSession,...PostMiddleware));

  return router;
};
export { DegenSessionsRouter };
export default DegenSessionsRouter;