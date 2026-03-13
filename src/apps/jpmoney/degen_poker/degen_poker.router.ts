import { Router } from 'express';
import { AuthJWT,PostMiddleware } from '@middleware';
import { appConfig } from './degen_poker.controller';

import AdminRouter from "./apis/admin";
import PlayersRouter from "./apis/players";
import SessionsRouter from "./apis/sessions";
import VenuesRouter from "./apis/venues";

const getDegenPokerRouter = () => {
  const DegenPokerRouter = Router();
  DegenPokerRouter.get("/config",[appConfig(),...PostMiddleware]);
  DegenPokerRouter.use("/admin",[AuthJWT(),AdminRouter()]);
  DegenPokerRouter.use("/players",[AuthJWT(),PlayersRouter()]);
  DegenPokerRouter.use("/sessions",[AuthJWT(),SessionsRouter()]);
  DegenPokerRouter.use("/venues",[AuthJWT(),VenuesRouter()]);
  return DegenPokerRouter;
};
export { getDegenPokerRouter };
export default getDegenPokerRouter;