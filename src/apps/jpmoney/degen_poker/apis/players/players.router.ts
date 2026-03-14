import { Router } from 'express';
import { DegenPlayersController as ctrl } from './players.controller';
import { DegenPlayersValidators as validators } from './players.validators';
import { PostMiddleware,upload } from '@middleware';

const DegenPlayersRouter = () => {
  const router = Router();
  
  router.post("/",[...validators.registerPlayer,ctrl.registerPlayer,...PostMiddleware]);
  router.get("/:playerId",[ctrl.getPlayerById,...PostMiddleware]);
  router.put("/:playerId",[...validators.updatePlayer, ctrl.updatePlayer,...PostMiddleware]);
  router.delete("/:playerId",[ctrl.deletePlayer,...PostMiddleware]);
  router.put("/:playerId/status",[...validators.updatePlayerStatus, ctrl.updatePlayerStatus,...PostMiddleware]);

  return router;
};
export { DegenPlayersRouter };
export default DegenPlayersRouter;