import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const jwtSecret = process.env.JWT_KEY || "supersecretkey";
const refreshSecret = process.env.REFRESH_SECRET || 'refreshsecret';
const resetSecret = process.env.REFRESH_SECRET || 'resetsecret';
const saltRounds = Number(process.env.SALT_ROUNDS || 10);
const devStaticVerify = process.env.DEV_STATIC_VERIFY;

const TOKEN_EXPIRATION = '3h'; // 24 hour
const REFRESH_EXPIRATION = '7d'; // 7 days
const RESET_EXPIRATION = '15m'; // 7 days

const notify = Services.Notifications.createNotification;
const {EMAIL,SMS} = Types.IContactMethods;

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
      await AppUsage.make(`usr/${user.id}`,"userLoggedIn (Unrecognized)");
      await AppUsage.make("sys-admn","notified user - Unrecognized Login");
    }
    else await AppUsage.make(`usr/${user.id}`,"userLoggedIn");
    return unrecognized;
  };
  static sendVerificationReq = async (user:Types.IUser,type:Types.IContactMethods) => {
    const verification = Utils.shortId();
    const audience = [{user:user.id as Types.IUser,info:user.getUserContactByMethod(type)}];
    user.set({
      verification:bcrypt.hashSync(verification,saltRounds),
      meta:{
        ...user.meta,
        verificationType:type,
        verificationSent:new Date(),
      }
    });
    await user.saveMe();
    await notify({
      type:"VERIFY",
      method:type,
      audience,
      data:{verification}
    });
    await AppUsage.make("sys-admn","sendVerificationReq");
  };
  static generateToken = async (
    type:Types.IAuthToken["type"],
    {id:userId,username,role}:Types.IUser,
  ) => {
    let secret:any = "",expiresIn:any = "";
    switch(type){
      case "access":secret = jwtSecret;expiresIn = TOKEN_EXPIRATION;break;
      case "refresh":secret = refreshSecret;expiresIn = REFRESH_EXPIRATION;break;
      case "reset":secret = resetSecret;expiresIn = RESET_EXPIRATION;break;
    }
    const sub = Utils.hexId(32);
    const payload:Partial<Types.IAuthToken> = {type,userId,username,role,sub};
    const token = jwt.sign(payload,secret,{expiresIn,issuer:"cctx-auth"});
    const decoded = jwt.verify(token,secret) as Types.IAuthToken;
    const unixTime = Number(String(decoded.exp).padEnd(13,'0'));
    const expires = new Date(unixTime);
    
    if(type == "refresh") await Models.AuthToken.findOneAndUpdate({userId},decoded,{upsert:true});
    return {token,expires};
  };
}
export default AuthUtilsService;