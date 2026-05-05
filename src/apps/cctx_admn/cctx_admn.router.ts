import { Router } from 'express';
import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { appConfig } from './cctx_admn.controller';

import getAdminUIRouter from "./apis/bull_ui";
import getAdminRouter from "./apis/admin";

const getCCTXAdmnRouter = () => {
  const CCTXAdmnRouter = Router();
  CCTXAdmnRouter.get("/config",loadV5(appConfig(),...PostMiddleware));
  CCTXAdmnRouter.use("/admin",loadV5(AuthJWT(),getAdminRouter()));
  CCTXAdmnRouter.use("/sys/ui",getAdminUIRouter());
  return CCTXAdmnRouter;
};
export { getCCTXAdmnRouter };
export default getCCTXAdmnRouter;