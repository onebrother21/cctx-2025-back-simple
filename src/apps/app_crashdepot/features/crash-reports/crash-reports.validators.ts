import { body,param } from 'express-validator';
import { CheckValidation } from '../../../../middlewares';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class CrashReportsValidators {
  // 📌 CrashReport & Fulfillment Validators
  static createCrashReport = [[
    param('orderId').isMongoId().withMessage('Invalid order ID')
  ],CheckValidation()] as IHandler[];
  
  static updateCrashReport = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
  ],CheckValidation()] as IHandler[];
  
  static updateCrashReportStatus = [[
    param('orderId').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['preparing', 'ready', 'completed']).withMessage('Invalid status value')
  ],CheckValidation()] as IHandler[];
};
export default CrashReportsValidators;