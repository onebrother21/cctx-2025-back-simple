import { body,param } from 'express-validator';

import { CheckValidation } from '../../../../../middlewares';
import UpcentricTypes from '../../types';
import Types from "../../../../../types";
import Utils from '../../../../../utils';

export class DegenSessionsValidators {
  static registerAdmin = [[
    body('data.app').isString().withMessage('Invalid app').optional(),
    body('data.type').isString().withMessage('Invalid type').optional(),
    body('data.displayName').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
    body('data.org').isString().withMessage('Invalid org').optional(),
    body('data.bio').isString().withMessage('Invalid bio').optional(),
    body('data.img').trim().escape().notEmpty().withMessage('Invalid image').optional(),
    body('data.loc').isArray({min:2,max:2}).withMessage('Invalid location'),
    body('data.loc.*').isNumeric().withMessage('Invalid location'),
  ],CheckValidation()] as IHandler[];

  static updateAdminProfile = [[
    body('data.displayName').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
    body('data.img').trim().escape().notEmpty().withMessage('Invalid image').optional(),
    body('data.loc').isArray({min:2,max:2}).withMessage('Invalid location'),
    body('data.loc.*').isNumeric().withMessage('Invalid location'),
  ],CheckValidation()] as IHandler[];

  static deleteAdminAccount = [[
    body('confirmDelete').equals('YES').withMessage('You must confirm account deletion')
  ],CheckValidation()] as IHandler[];
  
  // 📌 DegenSession & Fulfillment Validators
  static createDegenSession = [[
    body('data.title').isString().withMessage('Invalid title'),
    body('data.project').isString().withMessage('Invalid project'),
    body('data.lob').isString().withMessage('Invalid lob'),
    body('data.execAction').isString().withMessage('Invalid exec action'),
    body('data.desc').isString().withMessage('Invalid description'),
    body('data.dueOn').isISO8601().withMessage('Invalid due date'),
    body('data.startOn').isISO8601().withMessage('Invalid start date'),
  ],CheckValidation()] as IHandler[];
  
  static updateDegenSession = [[
    param('sessionId').isMongoId().withMessage('Invalid session ID'),
    body('data.title').isString().withMessage('Invalid title').optional(),
    body('data.project').isString().withMessage('Invalid project').optional(),
    body('data.lob').isString().withMessage('Invalid lob').optional(),
    body('data.execAction').isString().withMessage('Invalid exec action').optional(),
    body('data.desc').isString().withMessage('Invalid description').optional(),
    body('data.dueOn').isISO8601().withMessage('Invalid due date').optional(),
    body('data.startOn').isISO8601().withMessage('Invalid start date').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateDegenSessionStatus = [[
    param('sessionId').isMongoId().withMessage('Invalid session ID'),
    body('data.name').isIn(Object.values(UpcentricTypes.IDegenSessionStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
};
export default DegenSessionsValidators;