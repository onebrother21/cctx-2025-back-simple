import { Router } from 'express';
import { BugsController as ctrl } from './bugs.controller';
import { BugsValidators as validators } from './bugs.validators';
import { PostMiddleware,upload } from '../../../../middlewares';
import Utils from '../../../../utils';

const BugsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 Bug Queries
  router.get("/q",[ctrl.queryBugs,...PostMiddleware]);
  router.get("/profiles/q",[ctrl.queryProfiles,...PostMiddleware]);
  
  // 📌 Bug Profile CRUD Ops
  router.post("/profiles",[ctrl.createProfile,...PostMiddleware]);

  // 📌 Bug CRUD Ops
  router.post("/",[...validators.createBug,ctrl.createBug,...PostMiddleware]);
  router.get("/:bugId",[ctrl.getBugById,...PostMiddleware]);
  router.put("/:bugId",[...validators.updateBug, ctrl.updateBug,...PostMiddleware]);
  router.delete("/:bugId",[ctrl.deleteBug,...PostMiddleware]);

  // 📌 Bug AddOns & Assignment
  router.put("/:bugId/status",[...validators.updateBugStatus, ctrl.updateBugStatus,...PostMiddleware]);
  router.post("/:bugId/admin",[ctrl.assignAdminToBug,...PostMiddleware]);
  router.delete("/:bugId/admin",[ctrl.unassignAdminFromBug,...PostMiddleware]);
  
  router.post("/:bugId/details",[ctrl.assignDetailsToBug,...PostMiddleware]);
  router.post("/:bugId/files",[ctrl.addFilesToBug,...PostMiddleware]);
  router.put("/:bugId/files/:fileIndex",[ctrl.addFilesToBug,...PostMiddleware]);
  router.delete("/:bugId/files/:fileIndex",[ctrl.addFilesToBug,...PostMiddleware]);
  
  // 📌 Bug Notation
  router.post("/:bugId/notes",[ctrl.addNotes,...PostMiddleware]);
  router.put("/:bugId/notes/:noteIdx",[ctrl.updateNote,...PostMiddleware]);
  router.delete("/:bugId/notes/:noteIdx",[ctrl.removeNote,...PostMiddleware]);

  router.post("/:bugId/tasks",[...validators.createBug,ctrl.createBug,...PostMiddleware]);
  router.get("/:bugId/tasks/:taskId",[ctrl.getBugById,...PostMiddleware]);
  router.put("/:bugId/tasks/:taskId",[...validators.updateBug, ctrl.updateBug,...PostMiddleware]);
  router.delete("/:bugId/tasks/:taskId",[ctrl.deleteBug,...PostMiddleware]);
  /*
  // 📌 Bug Attempts
  router.post("/:bugId/attempts",[ctrl.startAttempt,...PostMiddleware]);
  router.put("/:bugId/attempts/:attemptIndex",[ctrl.updateAttempt,...PostMiddleware]);
  router.post("/:bugId/attempts/:attemptIndex/finalize",[ctrl.finalizeAttempt,...PostMiddleware]);
  router.delete("/:bugId/attempts/:attemptIndex",[ctrl.removeAttempt,...PostMiddleware]);

  // 📌 Bug Artificats
  router.post("/:bugId/attempts/:attemptIndex/stops",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:bugId/attempts/:attemptIndex/interviews",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:bugId/attempts/:attemptIndex/notes",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:bugId/attempts/:attemptIndex/uploads",upload.single('file'),[ctrl.addAttemptActivity,...PostMiddleware]);
  router.delete("/:bugId/attempts/:attemptIndex/log/:itemIdx",[ctrl.removeAttemptActivity,...PostMiddleware]);
  */
  // 📌 Bug Resolution & Invoicing
  router.post("/:bugId/finalize",[ctrl.finalizeBug,...PostMiddleware]);
  router.post("/:bugId/close",[ctrl.closeBug,...PostMiddleware]);

  return router;
};
export { BugsRouter };
export default BugsRouter;