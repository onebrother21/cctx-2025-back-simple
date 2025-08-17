import { Router } from 'express';
import { DistrictLeadsController as ctrl } from './district-leads.controller';
import { DistrictLeadsValidators as validators } from './district-leads.validators';
import { PostMiddleware,upload } from '../../../../middlewares';
import Utils from '../../../../utils';

const DistrictLeadsRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 DistrictLead Queries
  router.get("/q",[ctrl.queryDistrictLeads,...PostMiddleware]);
  router.post("/",[...validators.createDistrictLead,ctrl.createDistrictLead,...PostMiddleware]);
  router.get("/:leadId",[ctrl.getDistrictLeadById,...PostMiddleware]);
  router.put("/:leadId",[...validators.updateDistrictLead, ctrl.updateDistrictLead,...PostMiddleware]);
  router.delete("/:leadId",[ctrl.deleteDistrictLead,...PostMiddleware]);

  return router;
};
export { DistrictLeadsRouter };
export default DistrictLeadsRouter;