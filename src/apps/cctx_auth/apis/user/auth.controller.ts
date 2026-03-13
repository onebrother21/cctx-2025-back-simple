import { AuthService } from './auth.service';
import { AuthUtilsService as AuthUtils } from './auth.utils';

import Types from "@types";
import {uploadToCloudinary} from "@middleware";

export class AuthController {
  static SignUp:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.signupUser(req);
      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:'User signup successfully',
        data:user.json(),
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Send2FA:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.send2FAVerification(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(),
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static ResendVerification:IHandler = async (req,res,next) => {
    try{
      const {user} = await AuthService.resendVerification(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(),
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Verify:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.verifyUser(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(),
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Register:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.registerUser(req);
      const loc = req.body.loc;

      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You registered successfully",
        data:user.json(true),
      };
      res.locals.tokens.access = await AuthUtils.generateToken("access",user);
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Login:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.loginUser(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
      };
      res.locals.tokens.access = await AuthUtils.generateToken("access",user);
      res.locals.tokens.refresh = await AuthUtils.generateToken("refresh",user);
      if(res.locals.tokens.access) res.cookie("cctx_auth_23j012",{ready:true},{
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000 * 60 * 30,
      });
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static LoginRefreshToken:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.LoginRefreshToken(req);
      const loc = req.body.data.loc;
      
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
      };
      res.locals.tokens.access = await AuthUtils.generateToken("access",user);
      res.locals.tokens.refresh = await AuthUtils.generateToken("refresh",user);
      if(res.locals.tokens.access) res.cookie("cctx_auth_23j012",{ready:true},{
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000 * 60 * 30,
      });
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Update:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.updateUser(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        //message:req.t(Utils.transStrings.profileupdatedsuccessfuly),
      };
      next();
    } catch(e){ next(e); }
  };
  static UpdateImg:IHandler = async (req,res,next) => {
    try {
      req.body.data = {upload:await uploadToCloudinary(req)};
      const {user} = await AuthService.updateImg(req);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        //message:req.t(Utils.transStrings.profileupdatedsuccessfuly),
      };
      next();
    }
    catch(e){ next(e); }
  };
  static Logout:IHandler = async (req,res,next) => {
    try {
      await AuthService.logoutUser(req);
      const {csrf} = res.locals.tokens;
      res.locals = {
        ...res.locals,
        success:true,
        tokens:{csrf},
        message:'Logout successful',
      };
      next();
    } catch(e){ next(e); }
  };
  static RequestPasswordReset:IHandler = async (req,res,next) => {
    try {
      await AuthService.initiatePinReset(req);
      res.locals = {
        ...res.locals,
        success:true,
        message:'Password reset email sent',
      };
      next();
    } catch(e){ next(e); }
  };
  static ResetPassword:IHandler = async (req,res,next) => {
    try {
      await AuthService.resetPin(req);
      res.locals = {
        ...res.locals,
        success:true,
        message:'Password successfully reset',
      };
      next();
    } catch(e){ next(e); }
  };
  static Autologin:IHandler = async (req,res,next) => {
    try {
      const user = req.user as Types.IUser;
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
      };
      next();
    } catch(e){ next(e); }
  };
  static ActivateProfile:IHandler = async (req,res,next) => {
    try {
      const {role} = req.body.data;
      const user = req.user as Types.IUser;
      user.device = req.device;
      user.role = role;
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
      };
      next();
    } catch(e){ next(e); }
  };
}
export default AuthController;