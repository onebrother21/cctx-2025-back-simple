import { Router } from 'express';
import { TasksController as ctrl } from './tasks.controller';
import { TasksValidators as validators } from './tasks.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';

const CCTXTasksRouter = () => {
  const router = Router();
  router.get("/q",loadV5(ctrl.queryTasks,...PostMiddleware));
  router.get("/desc/q",loadV5(ctrl.queryTaskDescriptions,...PostMiddleware));
  router.post("/many",loadV5(ctrl.createTasks,...PostMiddleware));
  router.post("/",loadV5(...validators.createTask,ctrl.createTask,...PostMiddleware));
  router.get("/:taskId",loadV5(ctrl.getTaskById,...PostMiddleware));
  router.put("/:taskId",loadV5(...validators.updateTask, ctrl.updateTask,...PostMiddleware));
  router.delete("/:taskId",loadV5(ctrl.deleteTask,...PostMiddleware));

  router.put("/:taskId/update/status",loadV5(ctrl.updateTaskStatus,...PostMiddleware));
  router.post("/:taskId/update/:updateType",loadV5(ctrl.addUpdateToTask,...PostMiddleware));
  router.delete("/:taskId/update/:updateType/:itemIdx",loadV5(ctrl.removeUpdateToTask,...PostMiddleware));

  router.post("/:taskId/finalize",loadV5(ctrl.finalizeTask,...PostMiddleware));
  router.post("/:taskId/close",loadV5(ctrl.closeTask,...PostMiddleware));

  return router;
};
export { CCTXTasksRouter };
export default CCTXTasksRouter;