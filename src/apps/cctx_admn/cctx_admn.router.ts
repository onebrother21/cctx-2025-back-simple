import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './cctx_admn.controller';

import getAdminUIRouter from "./apis/bull_ui";
import getAdminRouter from "./apis/admin";

const getCCTXAdmnRouter = () => {
  const CCTXAdmnRouter = Router();
  CCTXAdmnRouter.get("/config",[appConfig(),...PostMiddleware]);
  CCTXAdmnRouter.use("/admin",[AuthJWT(),getAdminRouter()]);
  CCTXAdmnRouter.use("/sys/ui",getAdminUIRouter());
  return CCTXAdmnRouter;
};
export { getCCTXAdmnRouter };
export default getCCTXAdmnRouter;