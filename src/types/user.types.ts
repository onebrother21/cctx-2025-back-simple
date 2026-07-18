import * as DEVICE from "./app-device.types";
import * as AUTH from "./auth.types";
import * as PROFILE from "./profile.types";

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
export type IUserType = AUTH.IAuthParams & {
  email:string;
  mobile:string;
  name:{first:string;last:string;};
  fullname:string;
  username:string;
  dob:Date;
  sex:"M"|"F"|"O";
  loc:{type:"Point",coordinates:[number,number]};
  info:Partial<{
    isTwoFactorReq:boolean;
    isAgeVerifyReq:boolean;
    // isLicenseVerified:boolean;
  }>;
  meta:Partial<{
    accepted2FA:Date;
    acceptedTOS:Date;
    acceptedCookies:Date;
    acceptedPrivacy:Date;
    ageVerified:Date;
    twoFactorSet:Date;
    lastUse:Date;
  }>;
  profiles:{name:string,obj:PROFILE.IProfile}[];
  profile:PROFILE.IProfile|null;
  devices:DEVICE.IAppDevice[];
  device:DEVICE.IAppDevice;
  location:AddressObj;
  role:string;
} & {
  toAge():number|null;
  getUserContactByMethod(method:AUTH.IContactMethods):string;
  getProfile():PROFILE.IProfile|null;
};
export type IUserObj = DocEntityObj<IUserType,IUserStatuses>;
export type IUserPre = Pick<IUserObj,"id"|"email"|"dob"|"loc">;
export type IUserJson = Omit<IUserObj,|"pin"|"reset"|"verification"|"profiles"|"profile"|"devices"|"device"|"dob"|"sex"|"loc"> & {
  profile:PROFILE.IProfileJson|PROFILE.IProfileJsonAuth|null;
};
export type IUserPreview = Pick<IUserObj,"id"|"username"|"fullname"|"location">;
export type IUser = DocEntity<IUserObj,IUserJson,IUserPreview>;

export type IUserQueryKeys = {
  strings:|"name.first"|"name.last"|"email"|"mobile"|"username"
  booleans:`info.${keyof IUser["info"]}`;
  dates:"created_on"|"dob";
  geoNear:"location";
};
export type IUserQuery = StrongQuery<IUserQueryKeys>;