import * as DEVICE from "./app-device.types";
import * as AUTH from "./auth.types";
import * as PROFILE from "./profile.types";
import {IAuthEvents} from "./user-action.types";

export enum IUserStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",
  LOCKED = "locked",
  DELETED = "deleted",
  VERIFIED = "verified",
}
export type IUserType = DocEntity & AUTH.IAuthParams & {
  email:string;
  mobile:string;
  name:{first:string;last:string;};
  fullname:string;
  username:string;
  dob:string|Date;
  sex:"M"|"F"|"O";
  meta:Partial<{
    accepted2FA:Date;
    acceptedTOS:Date;
    acceptedCookies:Date;
    acceptedPrivacy:Date;
    ageVerified:Date;
    lastUse:Date;
    twoFactorSet:Date;
  }>;
  info:Partial<{
    isTwoFactorReq:boolean;
    isAgeVerifyReq:boolean;
    // isLicenseVerified:boolean;
  }>;
  settings:any;
  loc:{type:"Point",coordinates:[number,number]},
  location:string,
  profiles:{name:string,obj:PROFILE.IProfile}[];
  profile:PROFILE.IProfileJson|null;
  devices:DEVICE.IAppDevice[];
  device:DEVICE.IAppDevice;
  role?:string;
};
export type IUserPreview = Pick<IUserType,|"id"|"username"|"fullname"|"location">;
export type IUserJson = Omit<IUserType,"profiles"|"dob"|"sex"|"loc">;
export interface IUserMethods {
  getUserContactByMethod(method:AUTH.IContactMethods):string;
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json(auth?:boolean):IUserJson;
  preview():IUserPreview;
  getProfile():PROFILE.IProfileJson|null;
}
export interface IUser extends IUserType,IUserMethods {}