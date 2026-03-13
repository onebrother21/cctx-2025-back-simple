import { Router } from 'express';
import { AdminController as ctrl } from './admin.controller';
import { AdminValidators as validators } from './admin.validators';
import { AuthJWT,PostMiddleware,upload } from '@middleware';

const AdminRouter = () => {
  const router = Router();
  //router.get("/app-usage/q",[ctrl.queryAppUsage,...PostMiddleware]);
  return router;
};
export { AdminRouter };
export default AdminRouter;