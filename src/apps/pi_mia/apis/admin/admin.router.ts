import { Router } from 'express';
import { PIMiaAdminController as ctrl } from './admin.controller';
import { PIMiaAdminValidators as validators } from './admin.validators';
import { AuthJWT,loadV5,PostMiddleware,upload } from '@middleware';

const getPIMiaAdminRouter = () => {
  const router = Router();
  router.post("/",loadV5(...validators.registerAdmin,ctrl.registerAdmin,...PostMiddleware));
  router.get("/:adminId",loadV5(ctrl.getAdminById,...PostMiddleware));
  router.put("/:adminId",loadV5(...validators.updateAdmin, ctrl.updateAdmin,...PostMiddleware));
  router.delete("/:adminId",loadV5(ctrl.deleteAdmin,...PostMiddleware));
  router.put("/:adminId/status",loadV5(...validators.updateAdminStatus,ctrl.updateAdminStatus,...PostMiddleware));
 
  return router;
};
export { getPIMiaAdminRouter };
export default getPIMiaAdminRouter;