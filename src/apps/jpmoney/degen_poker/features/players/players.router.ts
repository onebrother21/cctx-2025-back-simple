import { Router } from 'express';
import { DegenPlayersController as ctrl } from './players.controller';
import { DegenPlayersValidators as validators } from './players.validators';
import { PostMiddleware,upload } from '../../../../../middlewares';
import Utils from '../../../../../utils';

const DegenPlayersRouter = (cache:Utils.RedisCache) => {
  const router = Router();
  
  // 📌 DegenPlayer Queries
  router.get("/q",[ctrl.queryDegenPlayers,...PostMiddleware]);
  router.post("/many",[ctrl.createDegenPlayers,...PostMiddleware]);
  router.post("/",[...validators.registerPlayer,ctrl.registerPlayer,...PostMiddleware]);
  router.get("/:playerId",[ctrl.getDegenPlayerById,...PostMiddleware]);
  router.put("/:playerId",[...validators.updatePlayer, ctrl.updateDegenPlayer,...PostMiddleware]);
  router.delete("/:playerId",[ctrl.deleteDegenPlayer,...PostMiddleware]);
  router.put("/:playerId/status",[...validators.updateDegenPlayerStatus, ctrl.updateDegenPlayerStatus,...PostMiddleware]);

  return router;
};
export { DegenPlayersRouter };
export default DegenPlayersRouter;