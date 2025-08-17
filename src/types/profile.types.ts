

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
  APRROVED = "approved",
  REJECTED = "rejected",
  PENDING = "pending",
  CANCELLED = "cancelled",
}

export type IProfileType = DocEntity<IProfileStatuses> & {
  type:"app-admn"|"app-supr"|"acct-owner"|"acct-mgr"|"acct-admn"|"acct-user";
  approvalUpdates:Status<IApprovalStatuses>[];
  approval:Status<IApprovalStatuses>;
  name:string;
  displayName:string;
  dob:Date;
  sex:"M"|"F"|"O";
  emails:string[];
  phns:PhoneNumber[];
  addrs:AddressObj[];
  social:{platform:string,handle:string};
  org:string;
  info:any;
  meta:any;
  loc:{type:"Point",coordinates:[number,number]},
  location:string,
  img?:Pick<UploadResponse,"type"> & {
    id:string;
    url:string;
    time:Date;
    meta:Omit<UploadResponse,"type>">;
  };
  bio?:string;
};
export type IProfileITO = Pick<IProfileType,"id"|"name"|"displayName"|"img"|"type"|"org">;
export type IProfilePTO = IProfileITO & Pick<IProfileType,"bio">;
export type IProfileOTO = Pick<IProfileType,|"status"|"meta"|"location"> & 
IProfilePTO & {
  memberSince:Date;
  age:number;
};
export type IProfileOTOAuth = IProfileOTO & Pick<IProfileType,|"emails"|"addrs"|"sex"|"info"|"phns"|"approval"|"social">;
export interface IProfileMethods {
  toAge():number|null;
  setApproval(status?:IApprovalStatuses,info?:any):Promise<void>;
  saveMe(status?:IProfileStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  preview():IProfilePTO;
  json(isMe?:boolean):IProfileOTO|IProfileOTOAuth;
}
export interface IProfile extends IProfileType,IProfileMethods {}