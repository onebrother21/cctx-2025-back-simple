import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './pi-mia.controller';

import AdminRouter from "./apis/admin";
import CasesRouter from "./apis/cases";
import InvoicesRouter from "./apis/invoices";

const getPiMiaRouter = () => {
  const PiMiaRouter = Router();
  PiMiaRouter.get("/config",[appConfig(),...PostMiddleware]);
  PiMiaRouter.use("/admin",[AuthJWT(),AdminRouter()]);
  PiMiaRouter.use("/cases",[AuthJWT(),CasesRouter()]);
  PiMiaRouter.use("/invoices",[AuthJWT(),InvoicesRouter()]);
  return PiMiaRouter;
};
export { getPiMiaRouter };
export default getPiMiaRouter;