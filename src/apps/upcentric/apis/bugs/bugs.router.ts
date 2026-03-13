import { Router } from 'express';
import { BugsController as ctrl } from './bugs.controller';
import { BugsValidators as validators } from './bugs.validators';
import { PostMiddleware,upload } from '@middleware';
import Utils from '@utils';

const BugsRouter = () => {
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
  
  router.post("/:bugId/files",[ctrl.addFilesToBug,...PostMiddleware]);
  router.put("/:bugId/files/:fileIndex",[ctrl.addFilesToBug,...PostMiddleware]);
  router.delete("/:bugId/files/:fileIndex",[ctrl.addFilesToBug,...PostMiddleware]);
  
  // 📌 Bug Resolution & Invoicing
  router.post("/:bugId/finalize",[ctrl.finalizeBug,...PostMiddleware]);
  router.post("/:bugId/close",[ctrl.closeBug,...PostMiddleware]);

  return router;
};
export { BugsRouter };
export default BugsRouter;