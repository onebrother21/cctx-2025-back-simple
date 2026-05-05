import { Router } from 'express';
import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { appConfig } from './ping.controller';

import getAdminRouter from "./apis/admin";
import getUserOpsRouter from "./apis/user-ops";

const getPingRouter = () => {
  const PingRouter = Router();
  PingRouter.get("/config",loadV5(appConfig(),...PostMiddleware));
  PingRouter.use("/user/ops",loadV5(AuthJWT(),getUserOpsRouter()));
  PingRouter.use("/admin",loadV5(AuthJWT(),getAdminRouter()));
  return PingRouter;
};
export { getPingRouter };
export default getPingRouter;