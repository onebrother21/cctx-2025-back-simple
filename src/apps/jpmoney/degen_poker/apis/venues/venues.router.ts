import { Router } from 'express';
import { DegenVenuesController as ctrl } from './venues.controller';
import { DegenVenuesValidators as validators } from './venues.validators';
import { PostMiddleware,upload } from '@middleware';

const DegenVenuesRouter = () => {
  const router = Router();
  
  // 📌 DegenVenue Queries
  router.get("/addrs/s",[ctrl.lookupVenueAddress,...PostMiddleware]);
  router.get("/addrs/q",[ctrl.lookupVenueAddress2,...PostMiddleware]);
  router.get("/tags/q",[ctrl.queryDegenTags,...PostMiddleware]);
  router.get("/q",[ctrl.queryDegenVenues,...PostMiddleware]);
  //router.post("/many",[ctrl.createDegenVenues,...PostMiddleware]);
  router.post("/",[...validators.createDegenVenue,ctrl.createDegenVenue,...PostMiddleware]);
  router.get("/:venueId",[ctrl.getDegenVenueById,...PostMiddleware]);
  router.put("/:venueId",[...validators.updateDegenVenue, ctrl.updateDegenVenue,...PostMiddleware]);
  router.delete("/:venueId",[ctrl.deleteDegenVenue,...PostMiddleware]);
  router.put("/:venueId/status",[...validators.updateDegenVenueStatus, ctrl.updateDegenVenueStatus,...PostMiddleware]);
  router.post("/:venueId/start",[ctrl.finalizeDegenVenue,...PostMiddleware]);
  router.post("/:venueId/end",[ctrl.closeDegenVenue,...PostMiddleware]);

  return router;
};
export { DegenVenuesRouter };
export default DegenVenuesRouter;