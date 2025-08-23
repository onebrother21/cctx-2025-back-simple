import { Router } from 'express';
import { TasksController as ctrl } from './tasks.controller';
import { TasksValidators as validators } from './tasks.validators';
import { PostMiddleware,upload } from '../../../../middlewares';
import Utils from '../../../../utils';

const TasksRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 Task Queries
  router.get("/q",[ctrl.queryTasks,...PostMiddleware]);
  router.get("/profiles/q",[ctrl.queryProfiles,...PostMiddleware]);
  
  // 📌 Task Profile CRUD Ops
  router.post("/profiles",[ctrl.createProfile,...PostMiddleware]);

  // 📌 Task CRUD Ops
  router.post("/",[...validators.createTask,ctrl.createTask,...PostMiddleware]);
  router.get("/:taskId",[ctrl.getTaskById,...PostMiddleware]);
  router.put("/:taskId",[...validators.updateTask, ctrl.updateTask,...PostMiddleware]);
  router.delete("/:taskId",[ctrl.deleteTask,...PostMiddleware]);

  // 📌 Task AddOns & Assignment
  router.put("/:taskId/status",[...validators.updateTaskStatus, ctrl.updateTaskStatus,...PostMiddleware]);
  router.post("/:taskId/admin",[ctrl.assignAdminToTask,...PostMiddleware]);
  router.delete("/:taskId/admin",[ctrl.unassignAdminFromTask,...PostMiddleware]);
  
  router.post("/:taskId/details",[ctrl.assignDetailsToTask,...PostMiddleware]);
  router.post("/:taskId/files",[ctrl.addFilesToTask,...PostMiddleware]);
  router.put("/:taskId/files/:fileIndex",[ctrl.addFilesToTask,...PostMiddleware]);
  router.delete("/:taskId/files/:fileIndex",[ctrl.addFilesToTask,...PostMiddleware]);
  
  // 📌 Task Notation
  router.post("/:taskId/notes",[ctrl.addNotes,...PostMiddleware]);
  router.put("/:taskId/notes/:noteIdx",[ctrl.updateNote,...PostMiddleware]);
  router.delete("/:taskId/notes/:noteIdx",[ctrl.removeNote,...PostMiddleware]);

  /*
  // 📌 Task Attempts
  router.post("/:taskId/attempts",[ctrl.startAttempt,...PostMiddleware]);
  router.put("/:taskId/attempts/:attemptIndex",[ctrl.updateAttempt,...PostMiddleware]);
  router.post("/:taskId/attempts/:attemptIndex/finalize",[ctrl.finalizeAttempt,...PostMiddleware]);
  router.delete("/:taskId/attempts/:attemptIndex",[ctrl.removeAttempt,...PostMiddleware]);

  // 📌 Task Artificats
  router.post("/:taskId/attempts/:attemptIndex/stops",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:taskId/attempts/:attemptIndex/interviews",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:taskId/attempts/:attemptIndex/notes",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:taskId/attempts/:attemptIndex/uploads",upload.single('file'),[ctrl.addAttemptActivity,...PostMiddleware]);
  router.delete("/:taskId/attempts/:attemptIndex/log/:itemIdx",[ctrl.removeAttemptActivity,...PostMiddleware]);
  */
  // 📌 Task Resolution & Invoicing
  router.post("/:taskId/finalize",[ctrl.finalizeTask,...PostMiddleware]);
  router.post("/:taskId/close",[ctrl.closeTask,...PostMiddleware]);

  return router;
};
export { TasksRouter };
export default TasksRouter;