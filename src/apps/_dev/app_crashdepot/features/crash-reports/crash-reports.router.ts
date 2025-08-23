import { Router } from 'express';
import { CrashReportsController as ctrl } from './crash-reports.controller';
import { CrashReportsValidators as validators } from './crash-reports.validators';
import { PostMiddleware } from '../../../../middlewares';
import Utils from '../../../../utils';

const CrashReportsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 CrashReport & Fulfillment
  router.post("/",[...validators.createCrashReport,ctrl.createCrashReport,...PostMiddleware]);
  router.get("/:crashReportId",[ctrl.getCrashReportById,...PostMiddleware]);
  router.put(":/crashReportId/status",[...validators.updateCrashReportStatus, ctrl.updateCrashReportStatus,...PostMiddleware]);
  router.put("/:crashReportId",[...validators.updateCrashReport, ctrl.updateCrashReport,...PostMiddleware]);

  return router;
};
export { CrashReportsRouter };
export default CrashReportsRouter;