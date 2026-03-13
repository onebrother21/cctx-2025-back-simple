import { Router } from 'express';
import { CasesController as ctrl } from './cases.controller';
import { CasesValidators as validators } from './cases.validators';
import { PostMiddleware,upload } from '@middleware';
import Utils from '@utils';

const CasesRouter = () => {
  const router = Router();
  
  // 📌 Case Queries
  router.get("/search",[ctrl.queryCases,...PostMiddleware]);
  router.get("/invoices/search",[ctrl.queryInvoices,...PostMiddleware]);

  // 📌 Case CRUD Ops
  router.post("/",[...validators.createCase,ctrl.createCase,...PostMiddleware]);
  router.get("/:caseId",[ctrl.getCaseById,...PostMiddleware]);
  router.put("/:caseId",[...validators.updateCase, ctrl.updateCase,...PostMiddleware]);
  router.delete("/:caseId",[ctrl.deleteCase,...PostMiddleware]);

  // 📌 Case AddOns & Assignment
  router.put("/:caseId/status",[...validators.updateCaseStatus, ctrl.updateCaseStatus,...PostMiddleware]);
  router.post("/:caseId/subjects",[ctrl.addSubjectsToCase,...PostMiddleware]);
  router.put("/:caseId/subjects/:subjectIndex",[ctrl.updateSubject,...PostMiddleware]);
  router.delete("/:caseId/subjects/:subjectIndex",[ctrl.removeSubjectFromCase,...PostMiddleware]);
  router.post("/:caseId/subjects/:subjectIndex/addrs",[ctrl.addSubjectAddresses,...PostMiddleware]);
  router.post("/:caseId/files",[ctrl.addFilesToCase,...PostMiddleware]);
  router.put("/:caseId/files/:fileIndex",[ctrl.addFilesToCase,...PostMiddleware]);
  router.delete("/:caseId/files/:fileIndex",[ctrl.addFilesToCase,...PostMiddleware]);
  router.post("/:caseId/details",[ctrl.addDetailsToCase,...PostMiddleware]);
  router.post("/:caseId/admin",[ctrl.assignAdminToCase,...PostMiddleware]);

  // 📌 Case Notation
  router.post("/:caseId/notes",[ctrl.addNotes,...PostMiddleware]);
  router.put("/:caseId/notes/:noteIdx",[ctrl.updateNote,...PostMiddleware]);
  router.delete("/:caseId/notes/:noteIdx",[ctrl.removeNote,...PostMiddleware]);

  // 📌 Case Attempts
  router.post("/:caseId/attempts",[ctrl.startAttempt,...PostMiddleware]);
  router.put("/:caseId/attempts/:attemptIndex",[ctrl.updateAttempt,...PostMiddleware]);
  router.post("/:caseId/attempts/:attemptIndex/finalize",[ctrl.finalizeAttempt,...PostMiddleware]);
  router.delete("/:caseId/attempts/:attemptIndex",[ctrl.removeAttempt,...PostMiddleware]);

  // 📌 Case Artificats
  router.post("/:caseId/attempts/:attemptIndex/stops",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:caseId/attempts/:attemptIndex/interviews",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:caseId/attempts/:attemptIndex/notes",[ctrl.addAttemptActivity,...PostMiddleware]);
  router.post("/:caseId/attempts/:attemptIndex/uploads",upload.single('file'),[ctrl.addAttemptActivity,...PostMiddleware]);
  router.delete("/:caseId/attempts/:attemptIndex/log/:itemIdx",[ctrl.removeAttemptActivity,...PostMiddleware]);

  // 📌 Case Resolution & Invoicing
  router.post("/:caseId/finalize",[ctrl.finalizeCase,...PostMiddleware]);
  router.post("/:caseId/close",[ctrl.closeCase,...PostMiddleware]);

  return router;
};
export { CasesRouter };
export default CasesRouter;