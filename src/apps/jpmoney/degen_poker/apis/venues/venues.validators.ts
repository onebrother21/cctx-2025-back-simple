import { body,param } from 'express-validator';
import { CheckValidation } from '@middleware';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

export class DegenVenuesValidators {
  static createDegenVenue = [[
    body('data.type').isString().withMessage('Invalid type'),
    body('data.name').trim().matches(/^[A-Z0-9 &'()]+$/i).withMessage('Invalid name'),
    body('data.org').trim().matches(/^[A-Z0-9 &'()]+$/i).withMessage('Invalid org').optional(),
    body('data.host').trim().matches(/^[A-Z0-9 &'()]+$/i).withMessage('Invalid host').optional(),
    body('data.info').isObject().withMessage('Invalid info').optional(),
    body('data.addr').isObject().withMessage('Invalid addr'),
    body('data.addr.info').isString().withMessage('Invalid location'),
    body('data.addr.loc').isArray({min:2,max:2}).withMessage('Invalid location'),
    body('data.addr.loc.*').isNumeric().withMessage('Invalid location'),
    body('data.phn').isString().withMessage('Invalid phone number').optional(),
    body('data.img').trim().notEmpty().withMessage('Invalid image').optional(),
  ],CheckValidation()] as IHandler[];
  static updateDegenVenue = [[
    param("venueId").isMongoId().withMessage('Invalid venue ID'),
    body('data.type').isString().withMessage('Invalid type').optional(),
    body('data.name').trim().matches(/^[A-Za-z0-9 &'()]{3-20}$/i).withMessage('Invalid name').optional(),
    body('data.org').trim().matches(/^[A-Za-z0-9 &'()]{3-20}$/i).withMessage('Invalid org').optional(),
    body('data.host').trim().matches(/^[A-Za-z0-9 &'()]{3-20}$/i).withMessage('Invalid host').optional(),
    body('data.info').isObject().withMessage('Invalid info').optional(),
    body('data.addr').isObject().withMessage('Invalid addr').optional(),
    body('data.addr.info').isString().withMessage('Invalid location').optional(),
    body('data.addr.loc').isArray({min:2,max:2}).withMessage('Invalid location').optional(),
    body('data.addr.loc.*').isNumeric().withMessage('Invalid location'),
    body('data.phn').isString().withMessage('Invalid phone number').optional(),
    body('data.img').trim().notEmpty().withMessage('Invalid image').optional(),
  ],CheckValidation()] as IHandler[];
  static updateDegenVenueStatus = [[
    param('venueId').isMongoId().withMessage('Invalid venue ID'),
    body('data.name').isIn(Object.values(Types.IProfileStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
  static deleteVenueAccount = [[
    param("venueId").isMongoId().withMessage('Invalid venue ID'),
    body('confirmDelete').equals('YES').withMessage('You must confirm account deletion')
  ],CheckValidation()] as IHandler[];
};
export default DegenVenuesValidators;