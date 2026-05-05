import { Router } from 'express';
import { MsgChainsController as ctrl } from './msgs.controller';
import { MsgChainsValidators as validators } from './msgs.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';

const CCTXMsgChainsRouter = () => {
  const router = Router();
  router.get("/q",loadV5(ctrl.queryMsgChains,...PostMiddleware));
  router.get("/desc/q",loadV5(ctrl.queryMsgChainDescriptions,...PostMiddleware));
  router.post("/many",loadV5(ctrl.createMsgChains,...PostMiddleware));
  router.post("/",loadV5(...validators.createMsgChain,ctrl.createMsgChain,...PostMiddleware));
  router.get("/:msgChainId",loadV5(ctrl.getMsgChainById,...PostMiddleware));
  router.put("/:msgChainId",loadV5(...validators.updateMsgChain, ctrl.updateMsgChain,...PostMiddleware));
  router.delete("/:msgChainId",loadV5(ctrl.deleteMsgChain,...PostMiddleware));

  router.put("/:msgChainId/update/status",loadV5(ctrl.updateMsgChainStatus,...PostMiddleware));
  router.post("/:msgChainId/msgs",loadV5(ctrl.addMsgToMsgChain,...PostMiddleware));
  router.delete("/:msgChainId/msgs/:msgIdx",loadV5(ctrl.removeMsgToMsgChain,...PostMiddleware));

  router.post("/:msgChainId/close",loadV5(ctrl.closeMsgChain,...PostMiddleware));

  return router;
};
export { CCTXMsgChainsRouter };
export default CCTXMsgChainsRouter;