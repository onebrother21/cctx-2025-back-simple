import { Router } from 'express';
import { DegenVenuesController as ctrl } from './venues.controller';
import { DegenVenuesValidators as validators } from './venues.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';

const DegenVenuesRouter = () => {
  const router = Router();
  
  router.get("/addrs/s",loadV5(ctrl.lookupVenueAddress,...PostMiddleware));
  router.get("/addrs/q",loadV5(ctrl.lookupVenueAddress2,...PostMiddleware));
  router.get("/tags/q",loadV5(ctrl.queryDegenTags,...PostMiddleware));
  router.get("/q",loadV5(ctrl.queryDegenVenues,...PostMiddleware));

  router.post("/many",loadV5(ctrl.createVenues,...PostMiddleware));
  router.post("/",loadV5(...validators.createVenue,ctrl.createVenue,...PostMiddleware));
  router.get("/:venueId",loadV5(ctrl.getVenueById,...PostMiddleware));
  router.put("/:venueId",loadV5(...validators.updateVenue, ctrl.updateVenue,...PostMiddleware));
  router.delete("/:venueId",loadV5(ctrl.deleteVenue,...PostMiddleware));
  router.put("/:venueId/status",loadV5(...validators.updateVenueStatus, ctrl.updateVenueStatus,...PostMiddleware));

  return router;
};
export { DegenVenuesRouter };
export default DegenVenuesRouter;