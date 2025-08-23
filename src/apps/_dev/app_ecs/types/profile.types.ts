
export enum IProfileStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISABLED = "disabled",
  ENABLED = "enabled",
  LOCKED = "locked",
  DELETED = "deleted"
};

export type IProfileType = DocEntity<IProfileStatuses> & {
  name:string;
  dob:Date;
  sex:"M"|"F"|"O";
  emails:string[];
  phns:PhoneNumber[];
  addrs:AddressObj[];
  social:{platform:string,handle:string};
  org:string;
  type:"subject"|"vendor"|"client"|"admin"|"contact";
  info:any;
  meta:any;
};
export interface IProfileMethods {
  json():Partial<IProfile>;
}
export interface IProfile extends IProfileType,IProfileMethods {}

export type IECSClient = Omit<IProfile,"dob">;
export type IECSVendor = Omit<IProfile,"dob">;
export type IECSContact = Omit<IProfile,"dob"> & {
  meta:{
    ref:string,
    rel:string
  }
};

export type IECSSubject = IProfile & {
  meta:{
    type:"primary"|"secondary";
    addrOnDateOfLoss:AddressObj;
    currentAddr:AddressObj;
    currentPhn:PhoneNumber;
    hasAtty:boolean;
    attyInfo:IProfile;
  };
};
export type IECSAdmin = Omit<IProfile,"dob"> & {
  meta:{
    rateAmt:number;
    rateUnit:"hr"|"attempt";
    mileageRate:number;
  };
};