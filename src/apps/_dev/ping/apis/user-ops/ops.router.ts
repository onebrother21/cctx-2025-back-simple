import { Router } from 'express';
import { UserOpsController as ctrl } from './ops.controller';
import { UserOpsValidators as validators } from './ops.validators';
import { AuthJWT,loadV5,PostMiddleware,upload } from '@middleware';

const UserOpsRouter = () => {
  const router = Router();
    router.post("/users",loadV5(...validators.registerUser,ctrl.registerUser,...PostMiddleware));
    router.get("/users/:profileId",loadV5(ctrl.getUserById,...PostMiddleware));
    router.put("/users/:profileId",loadV5(...validators.updateUser, ctrl.updateUser,...PostMiddleware));
    router.delete("/users/:profileId",loadV5(ctrl.deleteUser,...PostMiddleware));
    router.put("/users/:profileId/status",loadV5(...validators.updateUserStatus,ctrl.updateUserStatus,...PostMiddleware));
    
  return router;
};
export { UserOpsRouter };
export default UserOpsRouter;