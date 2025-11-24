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
}
export type IProfileType = DocEntity & {
  app:string;
  type:IProfileRoles;
  info:any;
  meta:any;
  approval:IApprovalStatuses;
  name:string;
  displayName:string;
  contact:{
    emails:string[];
    phns:PhoneNumber[];
    addrs:AddressObj[];
    socials:{platform:string,handle:string};
  };
  img?:Pick<UploadResponse,"type"> & {
    id:string;
    url:string;
    time:Date;
    meta:Omit<UploadResponse,"type">;
  };
  bio?:string;
  motto?:string;
  org?:string;
};
export type IProfilePreview = Pick<IProfileType,"app"|"type"|"displayName"|"bio"> & {img:string};
export type IProfileJson = Pick<IProfileType,|"status"|"meta"> & IProfilePreview & {
  creator:string;
  memberSince:Date;
  age:number;
};
export type IProfileJsonAuth = IProfileJson & Pick<IProfileType,|"contact"|"info"|"approval">;
export interface IProfileMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  preview():IProfilePreview;
  json(isMe?:boolean):IProfileJson|IProfileJsonAuth;
}
export interface IProfile extends IProfileType,IProfileMethods {}