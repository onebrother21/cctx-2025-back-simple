import { Router } from 'express';
import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { appConfig } from './cctx_dev_admn.controller';

import getAdminRouter from "../../cctx_admn/apis/admin";

const getCCTXDevAdmnRouter = () => {
  const CCTXDevAdmnRouter = Router();
  CCTXDevAdmnRouter.get("/config",loadV5(appConfig(),...PostMiddleware));
  CCTXDevAdmnRouter.use("/admin",loadV5(AuthJWT(),getAdminRouter()));
  return CCTXDevAdmnRouter;
};
export { getCCTXDevAdmnRouter };
export default getCCTXDevAdmnRouter;