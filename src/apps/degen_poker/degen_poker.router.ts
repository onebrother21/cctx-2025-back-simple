import { Router } from 'express';
import { AuthJWT,loadV5,PostMiddleware } from '@middleware';
import { appConfig } from './degen_poker.controller';

import AdminRouter from "./apis/admin";
import PlayersRouter from "./apis/players";
import SessionsRouter from "./apis/sessions";
import VenuesRouter from "./apis/venues";

const getDegenPokerRouter = () => {
  const DegenPokerRouter = Router();
  DegenPokerRouter.get("/config",loadV5(appConfig(),...PostMiddleware));
  DegenPokerRouter.use("/admin",loadV5(AuthJWT(),AdminRouter()));
  DegenPokerRouter.use("/players",loadV5(AuthJWT(),PlayersRouter()));
  DegenPokerRouter.use("/sessions",loadV5(AuthJWT(),SessionsRouter()));
  DegenPokerRouter.use("/venues",loadV5(AuthJWT(),VenuesRouter()));
  return DegenPokerRouter;
};
export { getDegenPokerRouter };
export default getDegenPokerRouter;