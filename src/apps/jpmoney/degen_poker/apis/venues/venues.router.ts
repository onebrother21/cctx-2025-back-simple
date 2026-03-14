import { Router } from 'express';
import { DegenVenuesController as ctrl } from './venues.controller';
import { DegenVenuesValidators as validators } from './venues.validators';
import { PostMiddleware,upload } from '@middleware';

const DegenVenuesRouter = () => {
  const router = Router();
  
  router.get("/addrs/s",[ctrl.lookupVenueAddress,...PostMiddleware]);
  router.get("/addrs/q",[ctrl.lookupVenueAddress2,...PostMiddleware]);
  router.get("/tags/q",[ctrl.queryDegenTags,...PostMiddleware]);
  router.get("/q",[ctrl.queryDegenVenues,...PostMiddleware]);

  router.post("/many",[ctrl.createVenues,...PostMiddleware]);
  router.post("/",[...validators.createVenue,ctrl.createVenue,...PostMiddleware]);
  router.get("/:venueId",[ctrl.getVenueById,...PostMiddleware]);
  router.put("/:venueId",[...validators.updateVenue, ctrl.updateVenue,...PostMiddleware]);
  router.delete("/:venueId",[ctrl.deleteVenue,...PostMiddleware]);
  router.put("/:venueId/status",[...validators.updateVenueStatus, ctrl.updateVenueStatus,...PostMiddleware]);

  return router;
};
export { DegenVenuesRouter };
export default DegenVenuesRouter;