import { body,oneOf } from "express-validator";
import { CheckValidation } from "../../../../middlewares";
import Utils from '../../../../utils';
import Types from "../../types";

export class AdminAcctsValidators {
  static registerAdmin = [[
    body('data.displayName').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
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

  static PostJob = [[
    body('data.type').trim().escape().notEmpty().withMessage("Job type is required"),
    body('data.opts.delay').isNumeric().withMessage("Invalid job parameters").optional(),
    body('data.opts.every').isNumeric().withMessage("Invalid job parameters").optional(),
    body('data.data').isObject().withMessage("Invalid job parameters").optional(),
  ],CheckValidation()] as IHandler[];
}
export default AdminAcctsValidators;