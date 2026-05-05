import * as USER from "./user.types";

export enum IProfileStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",
  LOCKED = "locked",
  DELETED = "deleted"
}
export enum IApprovalStatuses {
  REQUESTED = "requested",
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING = "pending",
  CANCELLED = "cancelled",
}
export enum IProfileRoles {
  APP_USER =  "app-user",
  APP_ADMN = "app-admn",
  APP_VENUE = "app-venue",
  APP_CLIENT = "app-client",
  APP_VENDOR = "app-vendor",
  APP_SUBJECT = "app-subject",
}
export type IProfileType = DocEntity<IProfileStatuses,USER.IUser> & {
  app:string;
  type:IProfileRoles;
  approval:IApprovalStatuses;
  name:string;
  displayName:string;
  contact:{
    emails:string[];
    phns:PhoneNumber[];
    addrs:AddressObj[];
    sm:SocialMediaObj[];
  };
  settings:{lang:"en"|"es"|"fr"} & Record<string,any>;
  meta:{memberSince:Date;};
  location?:AddressResult;
  bio?:string;
  motto?:string;
  org?:string;
  img?:ImageObj;
};
export type IProfileJson = Omit<IProfileType,"img"> & {img:string;age:number|null;};
export type IProfileJsonAuth = IProfileJson & Pick<IProfileType,|"approval">;
export type IProfilePreview = Pick<IProfileJson,"id"|"app"|"type"|"name"|"displayName"|"org"|"img">;

export interface IProfileMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  preview():IProfilePreview;
  json(isMe?:boolean):IProfileJson|IProfileJsonAuth;
}
export interface IProfile extends IProfileType,IProfileMethods {}
export type IProfileQueryKeys = {
  strings:"name"|"displayName"|"type"|"app"|"org"|"motto"|"bio"
  dates:"created_on"|"meta.member_since";
  geoNear:"location";
  any:"settings";
};
export type IProfileQuery = StrongQuery<IProfileQueryKeys>;