import { Router } from 'express';
import { AdminController as ctrl } from './admin.controller';
import { AdminValidators as validators } from './admin.validators';
import { AuthJWT,PostMiddleware,upload } from '@middleware';

const AdminRouter = () => {
  const router = Router();
  router.post("/",[...validators.registerAdmin,ctrl.registerAdmin,...PostMiddleware]);
  router.get("/:adminId",[ctrl.getAdminById,...PostMiddleware]);
  router.put("/:adminId",[...validators.updateAdmin, ctrl.updateAdmin,...PostMiddleware]);
  router.delete("/:adminId",[ctrl.deleteAdmin,...PostMiddleware]);
  router.put("/:adminId/status",[...validators.updateAdminStatus,ctrl.updateAdminStatus,...PostMiddleware]);
  
  return router;
};
export { AdminRouter };
export default AdminRouter;