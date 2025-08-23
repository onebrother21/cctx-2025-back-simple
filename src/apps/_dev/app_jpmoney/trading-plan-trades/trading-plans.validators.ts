import { body,param } from 'express-validator';
import { CheckValidation } from '../../../../middlewares';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class TradingPlanMgmtValidators {
  // 📌 TradingPlan & Fulfillment Validators
  static createTradingPlan = [[
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],CheckValidation()] as IHandler[];
  
  static updateTradingPlan = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
  ],CheckValidation()] as IHandler[];
  
  static updateTradingPlanStatus = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['preparing', 'ready', 'completed']).withMessage('Invalid status value')
  ],CheckValidation()] as IHandler[];
};
export default TradingPlanMgmtValidators;