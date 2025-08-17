import { SubscriptionsService } from './subscriptions.service';
import Types from "../../types";
import Utils from '../../../../utils';

export class SubscriptionsController {
  // Subscription & Fulfillment
  static createSubscription:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await SubscriptionsService.createSubscription(req.user.id,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static getSubscriptionById:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await SubscriptionsService.getSubscriptionById(req.user.id);
      next();
    } catch (e) { next(e); }
  };
  static updateSubscription:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await SubscriptionsService.updateSubscription(req.params.subscriptionId,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static updateSubscriptionStatus:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await SubscriptionsService.updateSubscriptionStatus(req.params.subscriptionId,req.body.data.status);
      next();
    } catch (e) { next(e); }
  };
}