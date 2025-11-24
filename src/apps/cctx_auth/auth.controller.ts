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
const uploadToCloudinary = async (req:IRequest) => {
  if(!(req.file && req.file.path)) throw "upload error";
  const filePath = req.file.path as string;
  const uploadRes = await cloudinary.uploader.upload(filePath, {
    resource_type: 'auto', // auto-detect image/audio/video
    folder: 'your_app_media'
  }) as any;
  fs.unlinkSync(filePath);
  return uploadRes;
};

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
        enc:true,
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Send2FA:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.send2faVerification(req);
      res.locals = {
        ...res.locals,
        status:200,
        success:true,
        data:user.json(),
        enc:true,
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static ResendVerification:IHandler = async (req,res,next) => {
    try{
      const {user} = await AuthService.resendVerification(req);
      res.locals.success = true,
      res.locals.data = user.json();
      res.locals.enc = true;
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
        enc:true,
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Register:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.registerUser(req);
      const app = req.url.split('/av3/')[0].split("/")[0];

      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You registered successfully",
        data:user.json(true),
        token:{access:await AuthUtilsService.generateToken(app,user,"access")},
        enc:true,
      };
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static Login:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.loginUser(req);
      const app = `${req.hostname}/av3/${req.body.data.app}`;
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        enc:true,
        token:{
          access:await AuthUtilsService.generateToken(app,user,"access"),
          refresh:await AuthUtilsService.generateToken(app,user,"refresh"),
        }
      };
      res.locals.token?res.cookie("cctx_auth_23j012",{ready:true},{
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000 * 60 * 30,
      }):null;
      req.user = user;
      next();
    } catch(e){ next(e); }
  };
  static LoginRefreshToken:IHandler = async (req,res,next) => {
    try {
      const {user} = await AuthService.refreshAuthToken(req);
      const app = `${req.hostname}/av3/${req.body.data.app}`;
      
      res.locals = {
        ...res.locals,
        success:true,
        data:user.json(true),
        enc:true,
        token:{
          access:await AuthUtilsService.generateToken(app,user,"access"),
          refresh:await AuthUtilsService.generateToken(app,user,"refresh"),
        }
      };
      res.locals.token?res.cookie("cctx_auth_23j012",{ready:true},{
        sameSite:"lax",
        path: '/',
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true,
        maxAge:1000 * 60 * 60 * 24,
      }):null;
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
        enc:true,
        data:user.json(true),
        //message:req.t(Utils.transStrings.profileupdatedsuccessfuly),
      };
      next();
    } catch(e){ next(e); }
  };
  static UpdateImg:IHandler = async (req,res,next) => {
    try {
      req.body.data.upload = await uploadToCloudinary(req);
      const {user} = await AuthService.updateUserImg(req);
      res.locals = {
        ...res.locals,
        success:true,
        enc:true,
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
      res.locals.success = true,
      res.locals.message = 'Logout successful';
      res.locals.token = {access:null,refresh:null};
      next();
    } catch(e){ next(e); }
  };
  static RequestPasswordReset:IHandler = async (req,res,next) => {
    try {
      await AuthService.initiatePinReset(req);
      res.locals.success = true;
      res.locals.message = 'Password reset email sent';
      next();
    } catch(e){ next(e); }
  };
  static ResetPassword:IHandler = async (req,res,next) => {
    try {
      await AuthService.resetPin(req);
      res.locals.success = true;
      res.locals.message =  'Password successfully reset';
      next();
    } catch(e){ next(e); }
  };
  static Auto:IHandler = async (req,res,next) => {
    try {
      const user = req.user as Types.IUser;
      res.locals.success = true;
      res.locals.enc = true;
      res.locals.data = user.json(true);
      next();
    } catch(e){ next(e); }
  };
  static ActivateProfile:IHandler = async (req,res,next) => {
    try {
      const {role} = req.body.data;
      const user = req.user as Types.IUser;
      user.device = req.device;
      user.role = role;
      res.locals.success = true;
      res.locals.enc = true;
      res.locals.data = user.json(true);
      next();
    } catch(e){ next(e); }
  };
}
export default AuthController;