import { Router } from 'express';
import { UserOpsController as ctrl } from './ops.controller';
import { UserOpsValidators as validators } from './ops.validators';
import { AuthJWT,PostMiddleware,upload } from '@middleware';

const UserOpsRouter = () => {
  const router = Router();
  router.post("/profile",[ctrl.queryAppUsage,...PostMiddleware]);
  router.put("/profile/:profileId",[ctrl.queryAppUsage,...PostMiddleware]);
  router.delete("/profile/:profileId",[ctrl.queryAppUsage,...PostMiddleware]);
  router.post("/profile/:profileId/status",[ctrl.queryAppUsage,...PostMiddleware]);
  return router;
};
export { UserOpsRouter };
export default UserOpsRouter;