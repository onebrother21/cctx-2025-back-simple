import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Models from '../../models';
import Services from '../../services';
import Types from "../../types";
import Utils from '../../utils';

const TOKEN_EXPIRATION = '1h'; // 1 hour
const REFRESH_EXPIRATION = '7d'; // 7 days
const RESET_EXPIRATION = '15m'; // 7 days

const jwtSecret = process.env.JWT_KEY || "supersecretkey";
const refreshSecret = process.env.REFRESH_SECRET || 'refreshsecret';
const resetSecret = process.env.REFRESH_SECRET || 'resetsecret';
const saltRounds = Number(process.env.SALT_ROUNDS || 10);
const devStaticVerify = process.env.DEV_STATIC_VERIFY;
const port = process.env.PORT;
const hostname = process.env.HOSTNAME;

export class AuthService {
  static lookupUser = async (email: string) => await Models.User.findOne({ email });
  static signupUser = async ({email,dob}:Types.IUserInit) =>  {
    if(await Models.User.findOne({email})) throw new Utils.AppError(400,"User already exists");
    const verification = Utils.shortId();
    const user = await Models.User.create({
      email,
      dob:new Date(dob),
      verification:bcrypt.hashSync(verification,saltRounds),
      verificationSent:new Date(),
    });
    return {user,verification};
  };
  static resendVerification = async ({email}:Types.IUserInit) =>  {
    const user = await Models.User.findOne({email});
    if(!user) throw new Utils.AppError(400,"User does not exists");
    const verification = Utils.shortId();
    user.set({
      verification:bcrypt.hashSync(verification,saltRounds),
      verificationSent:new Date(),
    });
    await user.save();
    return {user,verification};
  };
  static verifyUser = async ({id,verification}:Pick<Types.IUser,"id"|"email"|"verification">) => {
    const user = await Models.User.findById(id);
    const isMatch = await bcrypt.compare(verification,user.verification);
    const devVerify = devStaticVerify && devStaticVerify == verification;
    switch(true){
      case !user:
      case !devVerify && !isMatch:throw new Utils.AppError(401,"Email verification failed!");
      default:{
        user.verification = null;
        user.verificationSent = null;
        await user.setStatus(Types.IUserStatuses.ENABLED,null,true);
        return user;
      }
    }
  };
  static registerUser = async ({id,loc,email,...data}:Pick<Types.IUser,"id"|"email"|"name"|"pin"|"mobile"|"username"> & {loc:number[]}) => {
    const user = await Models.User.findById(id);
    if(!user) throw new Utils.AppError(401,"Registration failed!");
    user.set({
      name:data.name,
      mobile: data.mobile,
      username:data.username,
      pin:bcrypt.hashSync(data.pin,saltRounds),
      location:{type:"Point",coordinates:loc},
    });
    await user.setStatus(Types.IUserStatuses.ACTIVE,null,true);
    return user;
  };
  static loginUser = async ({email,pin}:Pick<Types.IUser,"email"|"pin">) => {
    const user = await AuthService.lookupUser(email);
    let unrecognized = false;
    if(!user || !await bcrypt.compare(pin,user.pin)) throw new Utils.AppError(401,'Ops! wrong Username or Password!');
    await user.setStatus(Types.IUserStatuses.ACTIVE,null,true);
    return {user,unrecognized};
  };
  static refreshAuthToken = async (refreshToken: string) => {
    if (!refreshToken) throw new Utils.AppError(401,'Unauthorized');
    const storedToken = await Models.AuthToken.findOne({ refreshToken });
    if (!storedToken) throw new Utils.AppError(403,'Invalid refresh token');
    try {
      const o = jwt.verify(refreshToken,jwtSecret) as Types.IAuthToken;
      const user = await Models.User.findById(o.userId);
      return user;
    }
    catch(e){throw new Utils.AppError(403,'Token refresh failed');}
  };
  static updateUser = async ({id}:Types.IUser,{name,dob,...$set}:Partial<Types.IUser>) => {
    const options = {new:true,runValidators:true};
    if($set.pin){
      const newPin = bcrypt.hashSync($set.pin,saltRounds);
      $set.pin = newPin as any;
    }
    const user = await Models.User.findByIdAndUpdate(id,{$set},options);
    return user;
  };
  static logoutUser = async (user:Types.IUser,token:Types.IAuthToken) => {
    await user.setStatus(Types.IUserStatuses.INACTIVE,null,true);
    await Models.DeadToken.findOneAndUpdate({userId:user.id},token,{upsert:true});
    await Models.AuthToken.findOneAndDelete({userId:user.id});
    return {ok:true};
  };
  static initiatePasswordReset = async ({email}:Pick<Types.IUser,"email">) => {
    const user = await Models.User.findOne({ email });
    if (!user) throw new Utils.AppError(404,'User not found');
    const resetToken = await AuthUtilsService.generateToken(user,"reset");
    return {user,resetToken};
  };
  static resetPassword = async ({token,pin}:{token: string, pin: string}) => {
    try {
      const {id:userId} = jwt.verify(token,resetSecret) as  IAppCreds;
      const user = await Models.User.findByIdAndUpdate(userId,{pin:bcrypt.hashSync(pin,saltRounds)});
      return {user};
    }
    catch (e){throw new Utils.AppError(400,'Invalid or expired token');}
  };
}

export class AuthUtilsService {
  static generateToken = async function ({id:userId,username}:Types.IUser,type:Types.IAuthToken["type"]){
    const hash = Utils.hexId(32);
    const payload:Partial<Types.IAuthToken> = {type,userId,username,sub:`av2/${hash}`};
    const issuer = `http://${hostname}:${port}`;
    let secret = "",expiresIn:any = "";
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
  static generateTokens = async function (user:Types.IUser){
    const accessToken = await this.generateToken(user,"access");
    const refreshToken = await this.generateToken(user,"refresh");
    return {accessToken,refreshToken};
  };
}