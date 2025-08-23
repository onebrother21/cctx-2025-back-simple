import { Router } from 'express';

import AuthRouter from './auth';
import TradingPlanMgmtRouter from "./trading-plan-trades";

import Utils from '../utils';
import { AuthJWT } from '../middlewares';

const getV3Router = (cache:Utils.RedisCache) => {
  const V3Router = Router();
  V3Router.use("/auth",AuthRouter(cache));
  V3Router.use("/plans",[AuthJWT(),TradingPlanMgmtRouter(cache)])
  return V3Router;
};
export { getV3Router };
export default getV3Router;

export * from "./admin-bull-ui";
export * from "./public";