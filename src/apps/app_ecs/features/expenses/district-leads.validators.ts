import { body,param } from 'express-validator';
import { CheckValidation } from '../../../../middlewares';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class DistrictLeadsValidators {
  // 📌 DistrictLead & Fulfillment Validators
  static createDistrictLead = [[
    body('data.reqNo').isAlphanumeric().withMessage('Invalid request number'),
  ],CheckValidation()] as IHandler[];
  
  static updateDistrictLead = [[
    param('caseId').isMongoId().withMessage('Invalid case id'),
    body('status').isIn(['preparing', 'ready', 'completed']).withMessage('Invalid status value').optional()
  ],CheckValidation()] as IHandler[];
  
  static updateDistrictLeadStatus = [[
    param('caseId').isMongoId().withMessage('Invalid case id'),
    body('name').isIn(['cancelled','pending','completed']).withMessage('Invalid status value').optional()
  ],CheckValidation()] as IHandler[];
  static addAttemptToDistrictLead = [[
    param('caseId').isMongoId().withMessage('Invalid case id'),
    body('data.reqNo').isAlphanumeric().withMessage('Invalid request number'),
  ],CheckValidation()] as IHandler[];
};
export default DistrictLeadsValidators;