import { body,param } from 'express-validator';

import { CheckValidation } from '../../../../../middlewares';
import DegenPokerTypes from '../../types';
import Types from "../../../../../types";
import Utils from '../../../../../utils';

export class DegenPlayersValidators {
  static registerPlayer = [[
    body('data.app').isString().withMessage('Invalid app'),
    body('data.type').isString().withMessage('Invalid type'),
    body('data.displayName').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
    body('data.org').isString().withMessage('Invalid org').optional(),
    body('data.bio').isString().withMessage('Invalid bio').optional(),
    body('data.img').trim().escape().notEmpty().withMessage('Invalid image').optional(),
    body('data.loc').isArray({min:2,max:2}).withMessage('Invalid location'),
    body('data.loc.*').isNumeric().withMessage('Invalid location'),
  ],CheckValidation()] as IHandler[];

  static updatePlayer = [[
    body('data.displayName').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
    body('data.img').trim().escape().notEmpty().withMessage('Invalid image').optional(),
    body('data.loc').isArray({min:2,max:2}).withMessage('Invalid location'),
    body('data.loc.*').isNumeric().withMessage('Invalid location'),
  ],CheckValidation()] as IHandler[];

  static deletePlayer = [[
    body('confirmDelete').equals('YES').withMessage('You must confirm account deletion')
  ],CheckValidation()] as IHandler[];
  
  static updateDegenPlayerStatus = [[
    param('sessionId').isMongoId().withMessage('Invalid session ID'),
    body('data.name').isIn(Object.values(Types.IProfileStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
};
export default DegenPlayersValidators;