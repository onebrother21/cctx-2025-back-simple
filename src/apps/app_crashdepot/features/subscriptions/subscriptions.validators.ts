import { body,param } from 'express-validator';

import { CheckValidation } from '../../../../middlewares';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class SubscriptionsValidators {
  // 📌 Subscription & Fulfillment Validators
  static createSubscription = [[
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],CheckValidation()] as IHandler[];
  
  static updateSubscription = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
  ],CheckValidation()] as IHandler[];
  
  static updateSubscriptionStatus = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['preparing', 'ready', 'completed']).withMessage('Invalid status value')
  ],CheckValidation()] as IHandler[];
};
export default SubscriptionsValidators;