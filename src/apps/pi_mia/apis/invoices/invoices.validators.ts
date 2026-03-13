import { body,param } from 'express-validator';
import { CheckValidation } from '@middleware';
import Types from "@types";
import Utils from '@utils';

import PiMiaTypes from '../../types';

export class InvoicesValidators {
  // 📌 PiMiaInvoice & Fulfillment Validators
  static createInvoice = [[
    body('data.type').isString().isIn(["C","T"]).withMessage('Invalid game type'),
    body('data.venue').isMongoId().withMessage('Invalid venue'),
    body('data.desc').isString().withMessage('Invalid description').optional(),
    body('data.dateOfPlay').isISO8601().withMessage('Invalid date of play'),
    body('data.startTime').isString().matches(/\d\d\:\d\d/).withMessage('Invalid start time'),
    //body('data.endTime').isString().matches(/\d\d\:\d\d/).withMessage('Invalid end time').optional(),
    body('data.info').isObject().withMessage("Invalid add'l info").optional(),
    body('data.info.startingStack').isNumeric().withMessage('Invalid starting stack').optional(),
    //body('data.info.place').isString().withMessage('Invalid description').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateInvoice = [[
    body('data.type').isString().isIn(["C","T"]).withMessage('Invalid game type').optional(),
    body('data.venue').isMongoId().withMessage('Invalid venue').optional(),
    body('data.desc').isString().withMessage('Invalid description').optional(),
    body('data.dateOfPlay').isISO8601().withMessage('Invalid date of play').optional(),
    body('data.startTime').isString().matches(/\d\d\:\d\d/).withMessage('Invalid start time').optional(),
    body('data.endTime').isString().matches(/\d\d\:\d\d/).withMessage('Invalid end time').optional(),
    /* TOURNEY ONLY */
    body('data.info').isObject().withMessage("Invalid add'l info").optional(),
    body('data.info.startingStack').isNumeric().withMessage('Invalid starting stack').optional(),
    /* case LEDGER UPDATES ONLY */
    body('data.ledger').isArray().withMessage('Invalid ledger update').optional(),
    body('data.ledger.*').isObject().withMessage('Invalid ledger update').optional(),
    body('data.ledger.*.amt').isNumeric().withMessage('Invalid ledger update'),
    body('data.ledger.*.reason').isString().withMessage('Invalid ledger update'),
    /* case HAND UPDATES ONLY */
    body('data.hand').isObject().withMessage('Invalid hand').optional(),
    body('data.hand.mine').isNumeric().withMessage('Invalid hand').optional(),
    body('data.hand.board').isArray().withMessage('Invalid board update').optional(),
    body('data.hand.board.*').isString().withMessage('Invalid board update').optional(),
    //body('data.hand.river').isString().withMessage('Invalid ledger update'),
    //body('data.hand.river').isString().withMessage('Invalid ledger update'),
    //body('data.info.place').isString().withMessage('Invalid description').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateInvoiceStatus = [[
    param('caseId').isMongoId().withMessage('Invalid case ID'),
    body('data.name').isIn(Object.values(PiMiaTypes.IInvoiceStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
};
export default InvoicesValidators;