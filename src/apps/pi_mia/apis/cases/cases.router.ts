import { Router } from 'express';
import { CasesController as ctrl } from './cases.controller';
import { CasesValidators as validators } from './cases.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';
import Utils from '@utils';

const CasesRouter = () => {
  const router = Router();
  
  // 📌 Case Queries
  router.get("/search",loadV5(ctrl.queryCases,...PostMiddleware));

  // 📌 Case CRUD Ops
  router.post("/",loadV5(...validators.createCase,ctrl.createCase,...PostMiddleware));
  router.get("/:caseId",loadV5(ctrl.getCaseById,...PostMiddleware));
  router.put("/:caseId",loadV5(...validators.updateCase, ctrl.updateCase,...PostMiddleware));
  router.delete("/:caseId",loadV5(ctrl.deleteCase,...PostMiddleware));

  // 📌 Case AddOns & Assignment
  router.put("/:caseId/status",loadV5(...validators.updateCaseStatus, ctrl.updateCaseStatus,...PostMiddleware));
  router.post("/:caseId/subjects",loadV5(ctrl.addSubjectsToCase,...PostMiddleware));
  router.put("/:caseId/subjects/:subjectIndex",loadV5(ctrl.updateSubject,...PostMiddleware));
  router.delete("/:caseId/subjects/:subjectIndex",loadV5(ctrl.removeSubjectFromCase,...PostMiddleware));
  router.post("/:caseId/subjects/:subjectIndex/addrs",loadV5(ctrl.addSubjectAddresses,...PostMiddleware));
  router.post("/:caseId/files",loadV5(ctrl.addFilesToCase,...PostMiddleware));
  router.put("/:caseId/files/:fileIndex",loadV5(ctrl.addFilesToCase,...PostMiddleware));
  router.delete("/:caseId/files/:fileIndex",loadV5(ctrl.addFilesToCase,...PostMiddleware));
  router.post("/:caseId/details",loadV5(ctrl.addDetailsToCase,...PostMiddleware));
  router.post("/:caseId/admin",loadV5(ctrl.assignAdminToCase,...PostMiddleware));

  // 📌 Case Notation
  router.post("/:caseId/notes",loadV5(ctrl.addNotes,...PostMiddleware));
  router.put("/:caseId/notes/:noteIdx",loadV5(ctrl.updateNote,...PostMiddleware));
  router.delete("/:caseId/notes/:noteIdx",loadV5(ctrl.removeNote,...PostMiddleware));

  // 📌 Case Attempts
  router.post("/:caseId/attempts",loadV5(ctrl.startAttempt,...PostMiddleware));
  router.put("/:caseId/attempts/:attemptIndex",loadV5(ctrl.updateAttempt,...PostMiddleware));
  router.post("/:caseId/attempts/:attemptIndex/finalize",loadV5(ctrl.finalizeAttempt,...PostMiddleware));
  router.delete("/:caseId/attempts/:attemptIndex",loadV5(ctrl.removeAttempt,...PostMiddleware));

  // 📌 Case Artificats
  router.post("/:caseId/attempts/:attemptIndex/stops",loadV5(ctrl.addAttemptActivity,...PostMiddleware));
  router.post("/:caseId/attempts/:attemptIndex/interviews",loadV5(ctrl.addAttemptActivity,...PostMiddleware));
  router.post("/:caseId/attempts/:attemptIndex/notes",loadV5(ctrl.addAttemptActivity,...PostMiddleware));
  router.post("/:caseId/attempts/:attemptIndex/uploads",upload.single('file'),loadV5(ctrl.addAttemptActivity,...PostMiddleware));
  router.delete("/:caseId/attempts/:attemptIndex/log/:itemIdx",loadV5(ctrl.removeAttemptActivity,...PostMiddleware));

  // 📌 Case Resolution & Invoicing
  router.post("/:caseId/finalize",loadV5(ctrl.finalizeCase,...PostMiddleware));
  router.post("/:caseId/close",loadV5(ctrl.closeCase,...PostMiddleware));

  return router;
};
export { CasesRouter };
export default CasesRouter;