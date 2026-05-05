import { Router } from 'express';
import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { appConfig } from './pi-mia.controller';

import AdminRouter from "./apis/admin";
import CasesRouter from "./apis/cases";
import InvoicesRouter from "./apis/invoices";

const getPiMiaRouter = () => {
  const PiMiaRouter = Router();
  PiMiaRouter.get("/config",loadV5(appConfig(),...PostMiddleware));
  PiMiaRouter.use("/admin",loadV5(AuthJWT(),AdminRouter()));
  PiMiaRouter.use("/cases",loadV5(AuthJWT(),CasesRouter()));
  PiMiaRouter.use("/invoices",loadV5(AuthJWT(),InvoicesRouter()));
  return PiMiaRouter;
};
export { getPiMiaRouter };
export default getPiMiaRouter;