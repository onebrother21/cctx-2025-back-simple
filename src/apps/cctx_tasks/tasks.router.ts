import { Router } from 'express';
import { TasksController as ctrl } from './tasks.controller';
import { TasksValidators as validators } from './tasks.validators';
import { PostMiddleware,upload } from '@middleware';

const CCTXTasksRouter = () => {
  const router = Router();
  router.get("/q",[ctrl.queryTasks,...PostMiddleware]);
  router.get("/desc/q",[ctrl.queryTaskDescriptions,...PostMiddleware]);
  //router.post("/many",[ctrl.createTasks,...PostMiddleware]);
  router.post("/",[...validators.createTask,ctrl.createTask,...PostMiddleware]);
  router.get("/:taskId",[ctrl.getTaskById,...PostMiddleware]);
  router.put("/:taskId",[...validators.updateTask, ctrl.updateTask,...PostMiddleware]);
  router.delete("/:taskId",[ctrl.deleteTask,...PostMiddleware]);

  router.put("/:taskId/update/status",[ctrl.updateTaskStatus,...PostMiddleware]);
  router.post("/:taskId/update/:updateType",[ctrl.addUpdateToTask,...PostMiddleware]);
  router.delete("/:taskId/update/:updateType/:itemIdx",[ctrl.removeUpdateToTask,...PostMiddleware]);

  router.post("/:taskId/finalize",[ctrl.finalizeTask,...PostMiddleware]);
  router.post("/:taskId/close",[ctrl.closeTask,...PostMiddleware]);

  return router;
};
export { CCTXTasksRouter };
export default CCTXTasksRouter;