import { AuthService,AuthUtilsService } from './auth.service';
import Utils from '../../utils';
import Types from "../../types";
import Services from "../../services";
const notify = Services.Notification.createNotification;

export class AuthController {
  static SignUp:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const {user,verification} = await AuthService.signupUser(data);
      res.locals.status = 201,
      res.locals.success = true,
      res.locals.message = 'User signup successfully',
      res.locals.data = user.json();
      // Send verificattion request
      const notificationMethod = Types.IContactMethods.EMAIL;
      const notificationData = {code:verification};
      await notify("VERIFY",notificationMethod,[user.id],notificationData);
      next();
    } catch(e){ next(e); }
  };
  static resendVerification:IHandler = async (req,res,next) => {
    try{
      const data = {...req.body.data};
      const {user,verification} = await AuthService.resendVerification(data);
      res.locals.success = true,
      res.locals.data = user.json();
      // Send verificattion request
      const notificationMethod = Types.IContactMethods.EMAIL;
      const notificationData = {code:verification};
      await notify("VERIFY",notificationMethod,[user.id],notificationData);
      next();
    } catch(e){ next(e); }
  };
  static VerifyEmail:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = await AuthService.verifyUser(data);
      res.locals.success = true;
      res.locals.data = user.json();
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Register:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = await AuthService.registerUser(data);
      res.locals.status = 201,
      res.locals.success = true,
      res.locals.message = req.t(Utils.transStrings.registeredsuccessfully,{name: user.name.first}),
      res.locals.data = user.json(true);
      res.locals.token = await AuthUtilsService.generateTokens(user);
      req.user = user;
      //send registration notification
      const notificationMethod = Types.IContactMethods.EMAIL;
      const notificationData = {name:Utils.cap(user.name.first as string)};
      await notify("REGISTER",notificationMethod,[user.id],notificationData);
      next();
    } catch(e){ next(e); }
  };
  static Login:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const {user,unrecognized} = await AuthService.loginUser(data);
      res.locals.success = true;
      res.locals.data = user.json(true);
      res.locals.token = await AuthUtilsService.generateTokens(user);
      req.user = user;
      // Send unrecognized device notification
      if(unrecognized) {
        const notificationMethod = Types.IContactMethods.SMS;
        const notificationData = {name:Utils.cap(user.name.first as string)};
        await notify("UNRECOGNIZED_LOGIN",notificationMethod,[user.id],notificationData);
      }
      next();
    } catch(e){ next(e); }
  };
  static LoginRefreshToken:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = await AuthService.refreshAuthToken(data);
      res.locals.success = true;
      res.locals.data = user.json(true);
      res.locals.token = await AuthUtilsService.generateTokens(user);
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Update:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user_ = req.user as Types.IUser;
      const user = await AuthService.updateUser(user_,data);
      res.locals.success = true;
      res.locals.message = req.t(Utils.transStrings.profileupdatedsuccessfuly),
      res.locals.data = user.json(true);
      next();
    } catch(e){ next(e); }
  };
  /** Logout of Hashdash appspace
   * 
   *  - Create dead token
   *  - How to handle session cookie?
   */
  static Logout:IHandler = async (req,res,next) => {
    try {
      const user = req.user as Types.IUser;
      const token = req.token as Types.IAuthToken;
      await AuthService.logoutUser(user,token);
      res.locals.success = true,
      res.locals.message = 'Logout successful';
      //res.locals.token = {accessToken:null,refreshToken:null};
      next();
    } catch(e){ next(e); }
  };
  static RequestPasswordReset:IHandler = async (req,res,next) => {
    try {
      const {user,resetToken} = await AuthService.initiatePasswordReset(req.body.data);
      res.locals.success = true;
      res.locals.message = 'Password reset email sent';
      //send PASSWORD RECOVERY NOTIFICATION
      const notificationMethod = Types.IContactMethods.EMAIL;
      const notificationData =  {resetLink:"localhost:3000/api/auth/reset?token=" + resetToken};
      await notify("RESET_PASSWORD",notificationMethod,[user.id],notificationData);
      next();
    } catch(e){ next(e); }
  };
  static ResetPassword:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.resetPassword(req.body.data);
      res.locals.success = true;
      res.locals.message =  'Password successfully reset';
      const notificationMethod = Types.IContactMethods.EMAIL;
      await notify("RESET_PASSWORD_SUCCESS",notificationMethod,[user.id]);
      next();
    } catch(e){ next(e); }
  };
  static Auto:IHandler = async (req,res,next) => {
    try {
      const user = req.user as Types.IUser;
      res.locals.success = true;
      res.locals.data = user.json(true);
      next();
    } catch(e){ next(e); }
  };
}
export default AuthController;