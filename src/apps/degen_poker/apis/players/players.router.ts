import { Router } from 'express';
import { DegenPlayersController as ctrl } from './players.controller';
import { DegenPlayersValidators as validators } from './players.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';

const DegenPlayersRouter = () => {
  const router = Router();
  
  router.post("/",loadV5(...validators.registerPlayer,ctrl.registerPlayer,...PostMiddleware));
  router.get("/:playerId",loadV5(ctrl.getPlayerById,...PostMiddleware));
  router.put("/:playerId",loadV5(...validators.updatePlayer, ctrl.updatePlayer,...PostMiddleware));
  router.delete("/:playerId",loadV5(ctrl.deletePlayer,...PostMiddleware));
  router.put("/:playerId/status",loadV5(
    ...validators.updatePlayerStatus,
    ctrl.updatePlayerStatus,
    ...PostMiddleware
  ));

  return router;
};
export { DegenPlayersRouter };
export default DegenPlayersRouter;