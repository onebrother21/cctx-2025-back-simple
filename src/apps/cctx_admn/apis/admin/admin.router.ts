import { Router } from 'express';
import { AdminController as ctrl } from './admin.controller';
import { AdminValidators as validators } from './admin.validators';
import { AuthJWT,PostMiddleware,upload } from '@middleware';

const AdminRouter = () => {
  const router = Router();
  router.get("/app-usage/q",[ctrl.queryAppUsage,...PostMiddleware]);
  router.get("/users/q",[ctrl.queryUsers,...PostMiddleware]);
  router.get("/devices/q",[ctrl.queryDevices,...PostMiddleware]);
  router.get("/degen/profiles/q",[ctrl.queryDegenProfiles,...PostMiddleware]);
  router.get("/degen/players/q",[ctrl.queryDegenPlayers,...PostMiddleware]);
  router.get("/degen/sessions/q",[ctrl.queryDegenSessions,...PostMiddleware]);
  router.get("/degen/venues/q",[ctrl.queryDegenVenues,...PostMiddleware]);
  router.get("/pi_mia/profiles/q",[ctrl.queryPiMiaProfiles,...PostMiddleware]);
  router.get("/pi_mia/cases/q",[ctrl.queryPiMiaCases,...PostMiddleware]);
  router.get("/pi_mia/invoices/q",[ctrl.queryPiMiaInvoices,...PostMiddleware]);
  router.get("/ping/profiles/q",[ctrl.queryPingProfiles,...PostMiddleware]);
  router.get("/ping/ext-wallets/q",[ctrl.queryPingExtWallets,...PostMiddleware]);
  router.get("/ping/ext-chains/q",[ctrl.queryPingExtChains,...PostMiddleware]);
  router.get("/ping/cards/q",[ctrl.queryPingCards,...PostMiddleware]);
  router.get("/ping/pos/q",[ctrl.queryPingPos,...PostMiddleware]);
  router.get("/ping/transactions/q",[ctrl.queryPingTransactions,...PostMiddleware]);
  return router;
};
export { AdminRouter };
export default AdminRouter;