import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Models from '../../models';
import Services from '../../services';
import Types from "../../types";
import Utils from '../../utils';
import { uploadFields } from "../../middlewares";

const jwtSecret = process.env.JWT_KEY || "supersecretkey";
const refreshSecret = process.env.REFRESH_SECRET || 'refreshsecret';
const resetSecret = process.env.REFRESH_SECRET || 'resetsecret';
const saltRounds = Number(process.env.SALT_ROUNDS || 10);
const devStaticVerify = process.env.DEV_STATIC_VERIFY;
const USE_2FA = process.env.USE_2FA;
const USE_VERIFY_AGE = process.env.USE_VERIFY_AGE;

const TOKEN_EXPIRATION = '24h'; // 24 hour
const REFRESH_EXPIRATION = '7d'; // 7 days
const RESET_EXPIRATION = '15m'; // 7 days
const queryOpts = {new:true,runValidators:true};

const notify = Services.Notifications.createNotification;
const {EMAIL,SMS} = Types.IContactMethods;

const {NEW,VERIFIED,ENABLED,ACTIVE,INACTIVE} = Types.IUserStatuses;
const userActions = Types.IAuthEvents;
const User = Models.User;
const AppUsage = Models.AppUsage;

export class AuthUtilsService {
  static lookupUser = async (emailOrUsername: string) => await User.findOne({
    $or:[{email:emailOrUsername},{username:emailOrUsername}],
  });
  static lookupUserId = async (id:string) => await User.findById(id);
  static throwIfUserExists = async (emailOrUsername:string) => {
    const user = await this.lookupUser(emailOrUsername);
    if(user) throw new Utils.AppError(400,"User already exists");
    return user;
  }
  static throwIfUserDoesntExist = async (emailOrUsername:string) => { 
    const user = await this.lookupUser(emailOrUsername);
    if(!user) throw new Utils.AppError(400,"User does not exist");
    return user;
  }
  static throwIfUserIdDoesntExist = async (id:string) => { 
    const user = await this.lookupUserId(id);
    if(!user) throw new Utils.AppError(400,"User does not exist");
    return user;
  }
  static validateAge = async (dob:string|Date) => {
    if(!Utils.isEighteenOrOlder(new Date(dob))) throw new Utils.AppError(400,"User must be 18 or older");
  };
  static validatePswd = async (user:Types.IUser,pin:string) => {
    const mismatch = !user || !await bcrypt.compare(pin,user.pin);
    if(mismatch) throw new Utils.AppError(401,'Ops! wrong Username or Password!');
    return true;
  }
  static validateVerify = async (user:Types.IUser,verification:string) => {
    const devVerify = devStaticVerify && devStaticVerify === verification;
    const isMatch = !devVerify && await bcrypt.compare(verification,user.verification);
    const didVerify = devVerify || isMatch;
    if(!didVerify) throw new Utils.AppError(401,"Email verification failed!");
    return didVerify;
  };
  static recognizeUserLogin = async (user:Types.IUser,device:Types.IAppDevice) => {
    const unrecognized = !user.devices.filter(d => d._id == device.id).length;
    if(unrecognized) {
      user.devices.push(device.id);
      await user.saveMe();
      await notify({
        type:"UNRECOGNIZED_LOGIN",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
        data:{name:Utils.cap(user.name.first as string)}
      });
      await AppUsage.make(user,"userLoggedIn (Unrecognized)");
      await AppUsage.make("sys-admn","notified user - Unrecognized Login");
    }
    else await AppUsage.make(user,"userLoggedIn");
    return unrecognized;
  }
  static sendVerificationReq = async (user:Types.IUser,type:Types.IContactMethods) => {
    const verification = Utils.shortId();
    user.set({
      verification:bcrypt.hashSync(verification,saltRounds),
      verificationType:type,
      verificationSent:new Date(),
    });
    await user.saveMe();
    await notify({
      type:"VERIFY",
      method:type,
      audience:[{user:user.id,info:user.getUserContactByMethod(type)}],
      data:{code:verification}
    });
    await AppUsage.make("sys-admn","sendVerificationReq");
  };
  static generateToken = async function (app:string,{id:userId,username,role}:Types.IUser,type:Types.IAuthToken["type"]){

    const hash = Utils.hexId(32);
    const payload:Partial<Types.IAuthToken> = {type,userId,username,role,sub:hash};
    const issuer = app;
    let secret:any = "",expiresIn:any = "";
    switch(type){
      case "access":secret = jwtSecret;expiresIn = TOKEN_EXPIRATION;break;
      case "refresh":secret = refreshSecret;expiresIn = REFRESH_EXPIRATION;break;
      case "reset":secret = resetSecret;expiresIn = RESET_EXPIRATION;break;
    }
    const token = jwt.sign(payload,secret,{expiresIn,issuer});
    const decoded = jwt.verify(token,secret) as Types.IAuthToken;
    if(type == "refresh") await Models.AuthToken.findOneAndUpdate({userId},decoded,{upsert:true});
    return token;
  };
}
export class AuthService {
  /** PRE AUTH/USER INIT */
  static signupUser = async (req:IRequest) =>  {
    type SignUp = Pick<Types.IUser,"email"|"dob"> & LocationObj;
    const {email,dob,loc} = req.body.data as SignUp;

    await AuthUtilsService.throwIfUserExists(email);
    USE_VERIFY_AGE && await AuthUtilsService.validateAge(dob);

    const user = new User({
      status:NEW,
      email,
      dob:new Date(dob),
      devices:[req.device],
      profiles:[],
      loc:{type:"Point",coordinates:loc},
      info:{
        isTwoFactorReq:true,
        isAgeVerifyReq:!!USE_VERIFY_AGE,
      },
      meta:{
        ...USE_VERIFY_AGE?{ageVerified:new Date()}:{},
      },
    });
    await AuthUtilsService.sendVerificationReq(user,EMAIL);
    await AppUsage.make(user,"userCreated",{loc});
    user.device = req.device;
    return {user};
  };
  static send2faVerification = async (req:IRequest) =>  {
    type Send2FA = Pick<Types.IUser,"id"|"mobile">;
    const {id,mobile} = req.body.data as Send2FA;

    const user = await AuthUtilsService.throwIfUserIdDoesntExist(id);
    user.mobile = mobile;

    if(user.info.isTwoFactorReq && !user.meta.accepted2fa){
      await AuthUtilsService.sendVerificationReq(user,SMS);
      await AppUsage.make(user,"sent2faVerification");
    }
    user.device = req.device;
    return {user};
  };
  static resendVerification = async (req:IRequest) =>  {
    type Send2FA = Pick<Types.IUser,"id">;
    const {id} = req.body.data as Send2FA;

    const user = await AuthUtilsService.throwIfUserIdDoesntExist(id);
    await AuthUtilsService.sendVerificationReq(user,user.verificationType);
    await AppUsage.make(user,"resentVerification");
    user.device = req.device;
    return {user};
  };
  static verifyUser = async (req:IRequest) => {
    type Verify =  Pick<Types.IUser,"id"|"verification"|"role">;
    const {id,verification:code,role} = req.body.data as Verify;

    const user = await AuthUtilsService.throwIfUserIdDoesntExist(id);
    await AuthUtilsService.validateVerify(user,code);

    user.set({
      verification:null,
      verificationType:null,
      verificationSent:null,
      status:VERIFIED,
      "meta.lastVerified":new Date(),
    });
    await user.saveMe();
    await AppUsage.make(user,"userVerified");
    user.device = req.device,
    user.role = role;
    return {user};
  };
  static registerUser = async (req:IRequest) => {
    type Register = Pick<Types.IUser,"email"|"name"|"pin"|"mobile"|"username"|"info"> & LocationObj;
    const {email,...data} = req.body.data as Register;

    const user = await AuthUtilsService.throwIfUserIdDoesntExist(req.body.data.id);
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
    })
    await AppUsage.make(user,"userRegistered");
    user.device = req.device;
    return {user};
  };
  /** AUTH */
  static loginUser = async (req:IRequest) => {
    type Login = Pick<Types.IUser,"pin"|"role"> & {emailOrUsername:string} & LocationObj;
    const {emailOrUsername,pin,role} = req.body.data as Login;

    const user = await AuthUtilsService.throwIfUserDoesntExist(emailOrUsername);
    await AuthUtilsService.validatePswd(user,pin);

    user.set({status:ACTIVE,"meta.lastLogin":new Date()});
    await user.saveMe();
    await AuthUtilsService.recognizeUserLogin(user,req.device);
    user.device = req.device;
    user.role = role;
    return {user};
  };
  static refreshAuthToken = async (req:IRequest) => {
    const refreshToken = req.body.data.refreshTkn;
    if (!refreshToken) throw new Utils.AppError(401,'Unauthorized');
    const storedToken = await Models.AuthToken.findOne({ refreshToken });
    if (!storedToken) throw new Utils.AppError(403,'Invalid refresh token');

    const o = jwt.verify(refreshToken,jwtSecret) as Types.IAuthToken;
    const user = await AuthUtilsService.throwIfUserIdDoesntExist(o.userId);

    user.meta.lastLogin = new Date();
    await user.saveMe();
    await AppUsage.make(user,"userLoggedIn (RefreshTkn)");
    user.device = req.device;
    user.role = storedToken.role;
    return {user};
  };
  /** POST AUTH */
  static updateUser = async (req:IRequest) => {
    const {name,profiles,devices,meta,...updates} = req.body.data as Partial<Types.IUser>;
    const {id} = req.user as Types.IUser;
    updates.pin?updates.pin = await bcrypt.hash(updates.pin,saltRounds) as any:null;
    const user = await AuthUtilsService.throwIfUserIdDoesntExist(id);
    user.meta = {...user.meta,...meta};
    user.set(updates);
    await user.saveMe();
    await AppUsage.make(user,`userUpdatedAcct - ${Object.keys(updates).join(",")}`);
    return {user};
  };
  static updateUserImg = async (req:IRequest) => {
    const {id} = req.user as Types.IUser;
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
    const user = await User.findById(id);
    const p = user.profiles[user.role];
    await p.updateOne({img});
    await user.updateOne({"meta.lastUse":new Date()});
    if(user) await AppUsage.make(user,`userUpdatedProfileImg`);
    return {user};
  };
  static logoutUser = async (req:IRequest) => {
    const user = req.user as Types.IUser;
    const token = req.token as Types.IAuthToken;
    user.status = INACTIVE;
    user.meta.lastLogout = new Date();
    await user.saveMe();
    await Models.DeadToken.findOneAndUpdate({userId:user.id},token,{upsert:true});
    await Models.AuthToken.findOneAndDelete({userId:user.id});
    await AppUsage.make(user,`userLoggedOut`);
    return {ok:true};
  };
  static initiatePinReset = async (req:IRequest) => {
    const device = req.device;
    const app = req.url.split("av3")[1].split("/")[0];
    const {email} = req.body.data as Pick<Types.IUser,"email">;
    const user = await User.findOne({ email });
    if (!user) throw new Utils.AppError(404,'User not found');
    const resetToken = await AuthUtilsService.generateToken(app,user,"reset");
    const resetLink = `${"localhost:3000"}/av3/pi-mia/auth/reset?token=` + resetToken;
    //send PASSWORD RECOVERY NOTIFICATION
    await notify({
      type:"RESET_PASSWORD",
      method:EMAIL,
      audience:[{user:user.id,info:user.email}],
      data:{}
    });
    await AppUsage.make(user,`userInitiatedPswdReset`);
  };
  static resetPin = async (req:IRequest) => {
    try {
      const device = req.device;
      const {token,pin} = req.body.data as {token:string,pin:string};
      const {id:userId} = jwt.verify(token,resetSecret) as  IAppCreds;
      const user = await User.findByIdAndUpdate(userId,{pin:await bcrypt.hash(pin,saltRounds)});
      await notify({
        type:"RESET_PASSWORD_SUCCESS",
        method:EMAIL,
        audience:[{user:user.id,info:user.email}],
      });
      await AppUsage.make(user,`userResetPswd`);
    }
    catch (e){throw new Utils.AppError(400,'Invalid or expired token');}
  };
}