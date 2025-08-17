import { TradingPlanMgmtService } from './trading-plans.service';
import Types from "../../types";
import Utils from '../../utils';

export class TradingPlanMgmtController {
  // TradingPlan & Fulfillment
  static createTradingPlan:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await TradingPlanMgmtService.createTradingPlan(req.user.id,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static getTradingPlanById:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await TradingPlanMgmtService.getTradingPlanById(req.user.id);
      next();
    } catch (e) { next(e); }
  };
  static updateTradingPlan:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await TradingPlanMgmtService.updateTradingPlan(req.params.planId,req.body.data);
      next();
    } catch (e) { next(e); }
  };
  static updateTradingPlanStatus:IHandler = async (req,res,next) => {
    try {
      res.locals.success = true;
      res.locals.data = await TradingPlanMgmtService.updateTradingPlanStatus(req.params.planId,req.body.data.status);
      next();
    } catch (e) { next(e); }
  };
}