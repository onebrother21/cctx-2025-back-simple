import { Router } from 'express';
import { AdminAcctsController as ctrl } from './admin-accts.controller';
import { AdminAcctsValidators as validators } from './admin-accts.validators';
import { PostMiddleware } from '../../../../middlewares';
import Utils from '../../../../utils';

const AdminAcctsRouter = (cache:Utils.RedisCache) => {
  const router = Router();

  // 📌 Admin Management
  router.post("/register",[...validators.registerAdmin,ctrl.registerAdmin,...PostMiddleware]);
  router.post("/sys/init",[ctrl.initializeSysAdmin(cache),...PostMiddleware]);
  router.put("/update",[...validators.updateAdminProfile, ctrl.updateAdmin,...PostMiddleware]);
  router.delete("/delete",[ctrl.deleteAdmin,...PostMiddleware]);
  router.delete("/delete/x",[ctrl.deleteXAdmin,...PostMiddleware]);
  // 🔹 User & Vendor Mgmt
  router.get("/approve",[ctrl.getAdminApprovals,...PostMiddleware]);
  router.post("/approve/:adminId",[ctrl.updateAdminApproval,...PostMiddleware]);
  return router;
};
export { AdminAcctsRouter };
export default AdminAcctsRouter;