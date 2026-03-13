import { Router } from 'express';

import AdminAcctsRouter from './apis/admin-accts';
import DistrictLeadsRouter from './apis/district-leads';
import FinancialLineItemRouter from './apis/expenses';
import BugsRouter from "./apis/bugs";

import Utils from '@utils';
import { AuthJWT, PostMiddleware } from '@middleware';
import { ApiConnectionController as ctrl } from './api-connect.controller';

const getUpcentricRouter = () => {
  const UpcentricRouter = Router();
  UpcentricRouter.get("/config",[ctrl.appConfig,...PostMiddleware]);
  UpcentricRouter.use("/admn",AdminAcctsRouter());
  UpcentricRouter.use("/bugs",[AuthJWT(),BugsRouter()]);
  UpcentricRouter.use("/leads",[AuthJWT(),DistrictLeadsRouter()]);
  UpcentricRouter.use("/fin/expenses",[AuthJWT(),FinancialLineItemRouter()]);
  return UpcentricRouter;
};
export { getUpcentricRouter };
export default getUpcentricRouter;