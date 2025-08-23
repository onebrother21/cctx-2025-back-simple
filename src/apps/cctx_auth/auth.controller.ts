import { AuthService,AuthUtilsService } from './auth.service';
import Utils from "../../utils";
import Types from "../../types";
import Services from "../../services";
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const notify = Services.Notifications.createNotification;
const {EMAIL,SMS} = Types.IContactMethods;

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
      await notify({
        type:"VERIFY",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
        data:{code:verification}
      });
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
      await notify({
        type:"VERIFY",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
        data:{code:verification}
      });
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
      res.locals.token = {accces:await AuthUtilsService.generateToken(data.app,user,"access")};
      req.user = user;
      //send registration notification
      await notify({
        type:"REGISTER",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
        data:{name:Utils.cap(user.name.first as string)}
      });
      next();
    } catch(e){ next(e); }
  };
  static Login:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const {user,unrecognized} = await AuthService.loginUser(data);
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        enc:true,
        token:{
          accces:await AuthUtilsService.generateToken(data.app,user,"access"),
          refresh:await AuthUtilsService.generateToken(data.app,user,"refresh"),
        }
      };
      if(res.locals.token) res.cookie("cctx_auth_23j012",{ready:true},{
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000 * 60 * 30,
      })
      req.user = user;
      // Send unrecognized device notification
      //if(unrecognized) {
        await notify({
          type:"UNRECOGNIZED_LOGIN",
          method:EMAIL,
          audience:[{user:user.id,info:user.email}],
          data:{name:Utils.cap(user.name.first as string)}
        });
      //}
      next();
    } catch(e){ next(e); }
  };
  static LoginRefreshToken:IHandler = async (req,res,next) => {
    try {
      const data = {...req.body.data};
      const user = await AuthService.refreshAuthToken(data);
      res.locals.success = true;
      res.locals.data = user.json(true);res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        enc:true,
        token:{
          accces:await AuthUtilsService.generateToken(data.app,user,"access"),
          refresh:await AuthUtilsService.generateToken(data.app,user,"refresh"),
        }
      };
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
  
  static UpdateImg:IHandler = async (req,res,next) => {
    try {
      if(!(req.file && req.file.path)) throw "upload error";
      const filePath = req.file.path as string;
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto', // auto-detect image/audio/video
        folder: 'your_app_media'
      }) as any;
      fs.unlinkSync(filePath);
      const data = {...uploadRes,...req.body};
      const user_ = req.user as Types.IUser;
      const user = await AuthService.updateUserImg(user_,data);
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
      const app = req.url.split("av3")[1].split("/")[0];
      const {user} = await AuthService.initiatePinReset(req.body.data);
      const resetToken = await AuthUtilsService.generateToken(app,user,"reset");
      res.locals.success = true;
      res.locals.message = 'Password reset email sent';
      //send PASSWORD RECOVERY NOTIFICATION
      await notify({
        type:"RESET_PASSWORD",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
        data:{resetLink:"localhost:3000/av3/pi-mia/auth/reset?token=" + resetToken}
      });
      next();
    } catch(e){ next(e); }
  };
  static ResetPassword:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.resetPin(req.body.data);
      res.locals.success = true;
      res.locals.message =  'Password successfully reset';
      await notify({
        type:"RESET_PASSWORD_SUCCESS",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
      });
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