import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { uploadFields } from "@middleware";

import AuthUtils from "./auth.utils";

const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const USE_2FA = process.env.USE_2FA;
const USE_VERIFY_AGE = process.env.USE_VERIFY_AGE;

const jwtSecret = process.env.JWT_KEY || "supersecretkey";
const refreshSecret = process.env.REFRESH_SECRET || 'refreshsecret';
const resetSecret = process.env.REFRESH_SECRET || 'resetsecret';

const queryOpts = {new:true,runValidators:true};

const notify = Services.Notifications.createNotification;

const {EMAIL,SMS} = Types.IContactMethods;
const {NEW,VERIFIED,ENABLED,ACTIVE,INACTIVE} = Types.IUserStatuses;

const User = Models.User;
const AppUsage = Models.AppUsage;

export class AuthService {
  /** PRE AUTH/USER INIT */
  static signupUser = async (req:IRequest) =>  {
    type SignUp = Pick<Types.IUser,"email"|"dob">;
    const {data:{email,dob},loc} = req.body as {data:SignUp} & LocationObj;
    const device = req.device as Types.IAppDevice;

    await AuthUtils.throwIfUserExists(email);
    USE_VERIFY_AGE && await AuthUtils.validateAge(dob);

    const user = new User({
      status:NEW,
      email,
      dob:new Date(dob),
      devices:[device],
      profiles:[],
      info:{
        isTwoFactorReq:true,
        isAgeVerifyReq:!!USE_VERIFY_AGE,
      },
      meta:{
        ...USE_VERIFY_AGE?{ageVerified:new Date()}:{},
      },
    });
    user.device = device;
    await AuthUtils.sendVerificationReq(user,EMAIL);
    await AppUsage.make(`usr/${user.id}`,"signedUp",{loc,device});
    await AppUsage.make("sys-admn","sentVerification - EMAIL");
    return {user};
  };
  static send2FAVerification = async (req:IRequest) =>  {
    type Send2FA = Pick<Types.IUser,"id"|"mobile">;
    const {data:{id,mobile},loc} = req.body as {data:Send2FA} & LocationObj;
    const device = req.device as Types.IAppDevice;

    const user = await AuthUtils.throwIfUserIdDoesntExist(id);
    user.mobile = mobile;
    user.device = req.device;
    if(user.info.isTwoFactorReq && !user.meta.accepted2FA){
      await AuthUtils.sendVerificationReq(user,SMS);
      await AppUsage.make(`usr/${user.id}`,"requested2faVerification",{loc});
      await AppUsage.make("sys-admn","sent2faVerification");
    }
    return {user};
  };
  static resendVerification = async (req:IRequest) =>  {
    type Resend = Pick<Types.IUser,"id">;
    const {data:{id},loc} = req.body as {data:Resend} & LocationObj;
    const device = req.device as Types.IAppDevice;

    const user = await AuthUtils.throwIfUserIdDoesntExist(id);
    user.device = req.device;
    await AuthUtils.sendVerificationReq(user,user.meta.verificationType);
    await AppUsage.make("sys-admn","resentVerification");
    return {user};
  };
  static verifyUser = async (req:IRequest) => {
    type Verify =  Pick<Types.IUser,"id"|"verification"|"role">;
    const {data:{id,verification:code,role},loc} = req.body as {data:Verify} & LocationObj;
    const device = req.device as Types.IAppDevice;

    const user = await AuthUtils.throwIfUserIdDoesntExist(id);
    await AuthUtils.validateVerify(user,code);
    
    const type = user.meta.verificationType;
    user.set({
      verification:null,
      verificationType:null,
      verificationSent:null,
      status:VERIFIED,
      "meta.lastVerified":new Date(),
    });
    await user.saveMe();
    user.device = req.device,
    user.role = role;
    await AppUsage.make(`usr/${user.id}`,`verified - ${type}`,{loc});
    return {user};
  };
  static registerUser = async (req:IRequest) => {
    type Register = Pick<Types.IUser,"email"|"name"|"pin"|"mobile"|"username"|"info">;
    const {data:{email,...data},loc} = req.body as {data:Register;} & LocationObj;
    const device = req.device as Types.IAppDevice;

    const user = await AuthUtils.throwIfUserIdDoesntExist(req.body.data.id);
    user.set({
      name:data.name,
      mobile: data.mobile,
      username:data.username,
      pin:await bcrypt.hash(data.pin,saltRounds),
      status:ENABLED,
      meta:{
        ...user.meta,
        ...data.info,
        registrationComplete:new Date(),
      }
    });
    await user.saveMe();
    await notify({
      type:"REGISTER",
      method:EMAIL,
      audience:[{user:user.id,info:user.email}],
      data:{name:Utils.cap(user.name.first as string)}
    });
    user.device = req.device;
    await AppUsage.make(`usr/${user.id}`,"registered",{loc});
    return {user};
  };
  /** AUTH */
  static loginUser = async (req:IRequest) => {
    type Login = Pick<Types.IUser,"pin"|"role"> & {emailOrUsername:string};
    const {data:{emailOrUsername,pin,role},loc} = req.body as {data:Login;} & LocationObj;
    const device = req.device as Types.IAppDevice;
    Utils.trace({emailOrUsername,role});

    const user = await AuthUtils.throwIfUserDoesntExist(emailOrUsername);
    await AuthUtils.validatePswd(user,pin);

    user.set({status:ACTIVE,"meta.lastLogin":new Date()});
    await user.saveMe();
    await AuthUtils.recognizeUserLogin(user,device);
    user.device = device;
    user.role = role;
    
    await AppUsage.make(`usr/${user.id}`,"loggedIn",{loc});
    return {user};
  };
  static LoginRefreshToken = async (req:IRequest) => {
    type Refresh = Pick<Types.IUser,"role"> & {refreshToken:string};
    const {data:{refreshToken},loc} = req.body as {data:Refresh;} & LocationObj;
    const device = req.device as Types.IAppDevice;

    if (!refreshToken) throw new Utils.AppError(401,'Unauthorized');
    const storedToken = await Models.AuthToken.findOne({ refreshToken });
    if (!storedToken) throw new Utils.AppError(403,'Invalid refresh token');

    const o = jwt.verify(refreshToken,jwtSecret) as Types.IAuthToken;
    const user = await AuthUtils.throwIfUserIdDoesntExist(o.userId);

    user.meta.lastLogin = new Date();
    await user.saveMe();
    await AppUsage.make(`usr/${user.id}`,"userLoggedIn (RefreshTkn)",{loc});
    user.device = req.device;
    user.role = storedToken.role;
    return {user};
  };
  /** POST AUTH */
  static updateUser = async (req:IRequest) => {
    const device = req.device as Types.IAppDevice;
    const {id} = req.user as Types.IUser;
    const {data,loc} = req.body as {data:Partial<Types.IUser>} & LocationObj;
    const {name,profiles,devices,meta,info,...updates} = data;
    const updateKeys = Object.keys(req.body.data).join(", ");
    const user = await AuthUtils.throwIfUserIdDoesntExist(id);

    updates.pin?updates.pin = await bcrypt.hash(updates.pin,saltRounds) as any:null;
    user.meta = {...user.meta,...meta};
    user.info = {...user.info,...info};
    user.set(updates);
    
    await user.saveMe();
    user.device = req.device;
    await AppUsage.make(`usr/${user.id}`,`updatedAcct - ${updateKeys}`,{loc});
    return {user};
  };
  static updateImg = async (req:IRequest) => {
    const device = req.device as Types.IAppDevice;
    const user = req.user as Types.IUser;
    const profile = req.profile;
    Utils.info({
      user,
      profile,
      role:req.user.role,
    })
    const {upload} = req.body.data;
    const o = upload as UploadResponse;
    const meta = uploadFields.reduce((n,k) => ({...n,[k]:o[k]}),{}) as any;
    const img = {
      id:o.public_id,
      type:o.type,
      time:o.original_date,
      url:o.secure_url,
      meta
    };
    profile.set({img});
    await profile.saveMe();
    user.meta.lastUse = new Date();
    await user.saveMe();
    user.device = req.device;
    await AppUsage.make(`usr/${user.id}`,`updatedProfileImg`);
    return {user};
  };
  static logoutUser = async (req:IRequest) => {
    const device = req.device as Types.IAppDevice;
    const user = req.user as Types.IUser;
    const token = req.token as Types.IAuthToken;

    user.status = INACTIVE;
    user.meta.lastLogout = new Date();
    await user.saveMe();
    await Models.DeadToken.findOneAndUpdate({userId:user.id},token,{upsert:true});
    await Models.AuthToken.findOneAndDelete({userId:user.id});
    user.device = req.device;
    await AppUsage.make(`usr/${user.id}`,`loggedOut`);
    return {ok:true};
  };
  static initiatePinReset = async (req:IRequest) => {
    const {data:{email},loc} = req.body as {data:Pick<Types.IUser,"email">} & LocationObj;
    const user = await User.findOne({ email });
    const device = req.device as Types.IAppDevice;

    if (!user) throw new Utils.AppError(404,'User not found');
    
    const apiDomain = req.headers["x-forwarded-host"] || req.headers.host;
    const resetToken = await AuthUtils.generateToken("reset",user);
    const resetLink = `${req.bvars.apiDomain}/av3/cctx/auth/reset?token=` + resetToken;

    user.device = req.device;
    await notify({
      type:"RESET_PASSWORD",
      method:EMAIL,
      audience:[{user:user.id,info:user.email}],
      data:{}
    });
    await AppUsage.make(`usr/${user.id}`,`initiatedPswdReset`,{loc});
    await AppUsage.make("sys-admn",`sendPswdResetLink`);
  };
  static resetPin = async (req:IRequest) => {
    const device = req.device as Types.IAppDevice;
    try {
      const {data:{token,pin},loc} = req.body as {data:{token:string,pin:string}} & LocationObj;
      const {id:userId} = jwt.verify(token,resetSecret) as  IAppCreds;
      const user = await User.findByIdAndUpdate(userId,{pin:await bcrypt.hash(pin,saltRounds)});
      await notify({
        type:"RESET_PASSWORD_SUCCESS",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
      });
      user.device = req.device;
      await AppUsage.make(`usr/${user.id}`,`userResetPswd`,{loc});
    }
    catch (e){throw new Utils.AppError(400,'Invalid or expired token');}
  };
}