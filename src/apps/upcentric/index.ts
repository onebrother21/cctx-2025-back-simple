import { Router } from 'express';

import AdminAcctsRouter from './features/admin-accts';
//import DistrictLeadsRouter from './features/district-leads';
//import FinancialLineItemRouter from './features/line-items';
//import TasksRouter from "./features/tasks";
//import BugsRouter from "./features/bugs";

import Utils from '../../utils';
import { AuthJWT, PostMiddleware } from '../../middlewares';
import { ApiConnectionController as ctrl } from './api-connect.controller';

const getUpcentricRouter = (cache:Utils.RedisCache) => {
  const UpcentricRouter = Router();
  UpcentricRouter.get("/config",[ctrl.appConfig,...PostMiddleware]);
  UpcentricRouter.use("/admn",AdminAcctsRouter(cache));

  //UpcentricRouter.use("/tasks",[AuthJWT(),TasksRouter(cache)]);
  //UpcentricRouter.use("/bugs",[AuthJWT(),BugsRouter(cache)]);
  //UpcentricRouter.use("/leads",[AuthJWT(),DistrictLeadsRouter(cache)]);
  //UpcentricRouter.use("/fin/budget/items",[AuthJWT(),FinancialLineItemRouter(cache)]);
  //UpcentricRouter.use("/fin/expenses",[AuthJWT(),FinancialLineItemRouter(cache)]);
  return UpcentricRouter;
};
export { getUpcentricRouter };
export default getUpcentricRouter;