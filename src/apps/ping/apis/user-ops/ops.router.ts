import { Router } from 'express';
import { UserOpsController as ctrl } from './ops.controller';
import { UserOpsValidators as validators } from './ops.validators';
import { AuthJWT,PostMiddleware,upload } from '@middleware';

const UserOpsRouter = () => {
  const router = Router();
    router.post("/users",[...validators.registerUser,ctrl.registerUser,...PostMiddleware]);
    router.get("/users/:profileId",[ctrl.getUserById,...PostMiddleware]);
    router.put("/users/:profileId",[...validators.updateUser, ctrl.updateUser,...PostMiddleware]);
    router.delete("/users/:profileId",[ctrl.deleteUser,...PostMiddleware]);
    router.put("/users/:profileId/status",[...validators.updateUserStatus,ctrl.updateUserStatus,...PostMiddleware]);
    
  return router;
};
export { UserOpsRouter };
export default UserOpsRouter;