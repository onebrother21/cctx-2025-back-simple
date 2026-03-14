import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './ping.controller';

import getAdminRouter from "./apis/admin";
import getUserOpsRouter from "./apis/user-ops";

const getPingRouter = () => {
  const PingRouter = Router();
  PingRouter.get("/config",[appConfig(),...PostMiddleware]);
  PingRouter.use("/user/ops",[AuthJWT(),getUserOpsRouter()]);
  PingRouter.use("/admin",[AuthJWT(),getAdminRouter()]);
  return PingRouter;
};
export { getPingRouter };
export default getPingRouter;