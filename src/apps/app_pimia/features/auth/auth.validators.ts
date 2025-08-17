import { body,oneOf } from "express-validator";
import { CheckValidation } from "../../../../middlewares";
import Utils from '../../../../utils';
import Types from "../../../../types";

export const AuthValidators = {
  Signup:[[
    body('data.email').isEmail().withMessage('Invalid email'),
    body('data.dob').isISO8601().withMessage('Invalid DOB').custom(Utils.isEighteenOrOlder),
    body('data.loc').isArray(),
    body('data.loc.*').if(body('data.loc').exists()).isNumeric().withMessage('Invalid preferences'),
  ],CheckValidation()] as IHandler[],
  VerifyEmail:[[
    body('data.id').isMongoId().withMessage('Invalid id'), 
    body('data.verification').isString().isLength({min:6}).withMessage('Invalid verification code'),
  ],CheckValidation()] as IHandler[],
  Register:[[
    body('data.id').isMongoId().withMessage('Invalid id'), 
    body('data.name').isObject().withMessage('Invalid name'),
    body('data.name.first').isString().withMessage('Invalid name').matches(/^[a-zA-Z\s]{2,20}$/).withMessage('Invalid name'),
    body('data.name.last').isString().withMessage('Invalid name').matches(/^[a-zA-Z\s]{2,20}$/).withMessage('Invalid name'),
    body('data.username').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid username'),
    body('data.mobile').isMobilePhone("en-US").withMessage('Invalid mobile number'),
    body('data.pin').isString().isLength({min:4,max:4}).withMessage('Invalid pin'),
  ],CheckValidation()] as IHandler[],
  Login:[[
    body('data.emailOrUsername').isString().withMessage('Invalid email'), 
    body('data.pin').isString().isLength({min:4,max:4}).withMessage('Invalid pin'),
  ],CheckValidation()] as IHandler[],
  Update:[[
    body('data.username').trim().escape().matches(/^[a-zA-Z0-9]{2,20}$/).withMessage('Invalid display name').optional(),
    body('data.email').isEmail().withMessage('Invalid email').optional(),
    body('data.mobile').isMobilePhone("en-US").withMessage('Invalid mobile').optional(),
    body('data.prefs').isObject().withMessage('Invalid preferences').optional(),
    oneOf([
      body('data.prefs.acceptCookies').if(body('data.prefs').exists()).isISO8601().withMessage('Invalid preferences'),
      body('data.prefs.acceptTerms').if(body('data.prefs').exists()).isISO8601().withMessage('Invalid preferences'),
      body('data.prefs.acceptPrivacy').if(body('data.prefs').exists()).isISO8601().withMessage('Invalid preferences'),
    ]),
  ],CheckValidation()] as IHandler[],
};
export default AuthValidators;