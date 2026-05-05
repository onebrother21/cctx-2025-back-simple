import { Router } from 'express';
import { GlassUserController as ctrl } from './user.controller';
import { GlassUserValidators as validators } from './user.validators';
import { loadV5,PostMiddleware } from '@middleware';

const GlassUserRouter = () => {
  const router = Router();
  router.post("/",loadV5(...validators.registerGlassUser,ctrl.registerGlassUser,...PostMiddleware));
  router.get("/:userId",loadV5(ctrl.getGlassUserById,...PostMiddleware));
  router.put("/:userId",loadV5(...validators.updateGlassUser, ctrl.updateGlassUser,...PostMiddleware));
  router.delete("/:userId",loadV5(ctrl.deleteGlassUser,...PostMiddleware));
  router.put("/:userId/status",loadV5(...validators.updateGlassUserStatus,ctrl.updateGlassUserStatus,...PostMiddleware));
  
  return router;
};
export { GlassUserRouter };
export default GlassUserRouter;