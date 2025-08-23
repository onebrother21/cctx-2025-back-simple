import { body,param } from 'express-validator';
import { CheckValidation } from '../../../../middlewares';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class FinancialLineItemsValidators {
  // 📌 FinancialLineItem & Fulfillment Validators
  static createFinancialLineItem = [[
    body('data.title').isString().withMessage('Invalid request number'),
    body('data.category').isString().withMessage('Invalid request number'),
    body('data.type').isString().withMessage('Invalid request number'),
    body('data.amount').isNumeric().withMessage('Invalid request number'),
    body('data.desc').isNumeric().withMessage('Invalid request number').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateFinancialLineItem = [[
    param('itemId').isMongoId().withMessage('Invalid item id'),
    body('status').isIn(['preparing', 'ready', 'completed']).withMessage('Invalid status value').optional()
  ],CheckValidation()] as IHandler[];
  
  static updateFinancialLineItemStatus = [[
    param('itemId').isMongoId().withMessage('Invalid item id'),
    body('name').isIn(['cancelled','pending','completed']).withMessage('Invalid status value').optional()
  ],CheckValidation()] as IHandler[];
  static addAttemptToFinancialLineItem = [[
    param('itemId').isMongoId().withMessage('Invalid item id'),
    body('data.reqNo').isAlphanumeric().withMessage('Invalid request number'),
  ],CheckValidation()] as IHandler[];
};
export default FinancialLineItemsValidators;