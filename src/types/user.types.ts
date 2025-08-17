import * as Auth from "./auth.types";
import * as Profiles from "./profile.types";

export enum IUserStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",
  LOCKED = "locked",
  DELETED = "deleted"
}
export enum IContactMethods {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in-app",
  AUTO = "auto",
}
export type IUserType = DocEntity<IUserStatuses> & Auth.IAuthParams & {
  email:string;
  mobile:string;
  name:{first:string;last:string;};
  fullname:string;
  username:string;
  dob:string|Date;
  sex:"M"|"F"|"O";
  meta:Partial<{
    isAgeVerified:boolean;
    isLicenseVerified:boolean;
    acceptedTerms:Date;
    acceptedUA:Date;
    acceptedCookies:Date;
    acceptedPrivacy:Date;
    lastUse:Date;
  }>;
  profiles:Record<string,Profiles.IProfile>;
  profile:Profiles.IProfileOTO|null;
  role?:string;
};
export type IUserITO = Pick<IUserType,"name"|"email"|"mobile"|"dob">;
export type IUserPTO = Pick<IUserType,"username"|"fullname"> & {id:string;img:string};
export type IUserOTO = Pick<IUserType,|"meta"|"status"|"info"|"profile"|"email"|"name"> & 
IUserPTO & {
  memberSince:Date;
  lastUse:Date;
  age:number;
};
export interface IUserMethods {
  toAge():number|null;
  getUserContactByMethod(method:IContactMethods):string;
  saveMe(status?:IUserStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json(auth?:boolean):IUserOTO;
  preview():IUserPTO;
  getProfile():Profiles.IProfileOTO|null;
}
export interface IUser extends IUserType,IUserMethods {}