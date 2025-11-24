import { Router } from 'express';
import { ApiConnect,AuthJWT, PostMiddleware } from '../../../middlewares';
import { ApiConnectionController as ctrl } from './api-connect.controller';
import PlayersRouter from "./features/players";
import SessionsRouter from "./features/sessions";
import Utils from '../../../utils';

const getDegenPokerRouter = (cache:Utils.RedisCache) => {
  const DegenPokerRouter = Router();
  DegenPokerRouter.get("/config",[ctrl.appConfig,...PostMiddleware]);
  DegenPokerRouter.post("/connect",[ApiConnect(),...PostMiddleware]);
  DegenPokerRouter.use("/players",[AuthJWT(),PlayersRouter(cache)]);
  DegenPokerRouter.use("/sessions",[AuthJWT(),SessionsRouter(cache)]);
  return DegenPokerRouter;
};
export { getDegenPokerRouter };
export default getDegenPokerRouter;