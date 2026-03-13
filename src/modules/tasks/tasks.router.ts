import { Router } from 'express';
import { CCTXTasksController as ctrl } from './tasks.controller';
import { CCTXTasksValidators as validators } from './tasks.validators';
import { PostMiddleware,upload } from '@middleware';

const CCTXTasksRouter = () => {
  const router = Router();
  
  // 📌 CCTXTask Queries
  router.get("/q",[ctrl.queryCCTXTasks,...PostMiddleware]);
  router.get("/desc/q",[ctrl.queryCCTXTaskDescriptions,...PostMiddleware]);
  //router.post("/many",[ctrl.createCCTXTasks,...PostMiddleware]);
  router.post("/",[...validators.createCCTXTask,ctrl.createCCTXTask,...PostMiddleware]);
  router.get("/:taskId",[ctrl.getCCTXTaskById,...PostMiddleware]);
  router.put("/:taskId",[...validators.updateCCTXTask, ctrl.updateCCTXTask,...PostMiddleware]);
  router.delete("/:taskId",[ctrl.deleteCCTXTask,...PostMiddleware]);

  router.put("/:taskId/update/status",[ctrl.updateCCTXTaskStatus,...PostMiddleware]);
  router.post("/:taskId/update/:updateType",[ctrl.addUpdateToCCTXTask,...PostMiddleware]);
  router.delete("/:taskId/update/:updateType/:itemIdx",[ctrl.removeUpdateToCCTXTask,...PostMiddleware]);

  router.post("/:taskId/finalize",[ctrl.finalizeCCTXTask,...PostMiddleware]);
  router.post("/:taskId/close",[ctrl.closeCCTXTask,...PostMiddleware]);

  return router;
};
export { CCTXTasksRouter };
export default CCTXTasksRouter;