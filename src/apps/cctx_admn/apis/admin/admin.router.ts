import { Router } from 'express';
import { AdminController as ctrl } from './admin.controller';
import { AdminValidators as validators } from './admin.validators';
import { AuthJWT,loadV5,PostMiddleware,upload } from '@middleware';

const AdminRouter = () => {
  const router = Router();
  router.get("/app-usage/q",loadV5(ctrl.queryAppUsage,...PostMiddleware));
  router.get("/devices/q",loadV5(ctrl.queryDevices,...PostMiddleware));
  router.get("/users/q",loadV5(ctrl.queryUsers,...PostMiddleware));
  router.get("/tasks/q",loadV5(ctrl.queryTasks,...PostMiddleware));
  router.get("/degen/profiles/q",loadV5(ctrl.queryDegenProfiles,...PostMiddleware));
  router.get("/degen/players/q",loadV5(ctrl.queryDegenPlayers,...PostMiddleware));
  router.get("/degen/sessions/q",loadV5(ctrl.queryDegenSessions,...PostMiddleware));
  router.get("/degen/venues/q",loadV5(ctrl.queryDegenVenues,...PostMiddleware));
  router.get("/pi_mia/profiles/q",loadV5(ctrl.queryPiMiaProfiles,...PostMiddleware));
  router.get("/pi_mia/cases/q",loadV5(ctrl.queryPiMiaCases,...PostMiddleware));
  router.get("/pi_mia/invoices/q",loadV5(ctrl.queryPiMiaInvoices,...PostMiddleware));
  router.get("/ping/profiles/q",loadV5(ctrl.queryPingProfiles,...PostMiddleware));
  router.get("/ping/ext-wallets/q",loadV5(ctrl.queryPingExtWallets,...PostMiddleware));
  router.get("/ping/ext-chains/q",loadV5(ctrl.queryPingExtChains,...PostMiddleware));
  router.get("/ping/cards/q",loadV5(ctrl.queryPingCards,...PostMiddleware));
  router.get("/ping/pos/q",loadV5(ctrl.queryPingPos,...PostMiddleware));
  router.get("/ping/transactions/q",loadV5(ctrl.queryPingTransactions,...PostMiddleware));
  return router;
};
export { AdminRouter };
export default AdminRouter;