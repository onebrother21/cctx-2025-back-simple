import { body,param } from 'express-validator';

import { CheckValidation } from '../../../../middlewares';
import UpcentricTypes from '../../types';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class BugsValidators {
  // 📌 Bug & Fulfillment Validators
  static createBug = [[
    body('data.title').isString().withMessage('Invalid title'),
    body('data.project').isString().withMessage('Invalid project'),
    body('data.lob').isString().withMessage('Invalid lob'),
    body('data.execAction').isString().withMessage('Invalid exec action'),
    body('data.desc').isString().withMessage('Invalid description'),
  ],CheckValidation()] as IHandler[];
  
  static updateBug = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.title').isString().withMessage('Invalid title').optional(),
    body('data.project').isString().withMessage('Invalid project').optional(),
    body('data.lob').isString().withMessage('Invalid lob').optional(),
    body('data.execAction').isString().withMessage('Invalid exec action').optional(),
    body('data.desc').isString().withMessage('Invalid description').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateBugStatus = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.name').isIn(Object.values(UpcentricTypes.IBugStatuses)).withMessage('Invalid status value'),
    body('data.info').isString().withMessage('Invalid msg').optional(),
  ],CheckValidation()] as IHandler[];
};
export default BugsValidators;