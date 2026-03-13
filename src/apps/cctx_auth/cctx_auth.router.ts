import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './cctx_auth.controller';

import getAdminRouter from "./apis/admin";
import getAuthRouter from "./apis/user";

const getCCTXAuthRouter = () => {
  const CCTXAuthRouter = Router();
  CCTXAuthRouter.get("/config",[appConfig(),...PostMiddleware]);
  CCTXAuthRouter.use("/user",[AuthJWT(),getAuthRouter()]);
  CCTXAuthRouter.use("/admin",[AuthJWT(),getAdminRouter()]);
  return CCTXAuthRouter;
};
export { getCCTXAuthRouter };
export default getCCTXAuthRouter;