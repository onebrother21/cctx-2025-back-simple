import Types from "../../../types";

export enum IUpcentricProfiles {
  ADMIN = "app-admn",
  ACCT_MGR = "acct-mgr"
}
export type IUpcentricClient = Omit<Types.IProfile,"dob">;
export type IUpcentricVendor = Omit<Types.IProfile,"dob">;
export type IUpcentricContact = Omit<Types.IProfile,"dob"> & {
  meta:{
    ref:string,
    rel:string
  }
};

export type IUpcentricSubject = Types.IProfile & {
  meta:{
    type:"primary"|"secondary";
    addrOnDateOfLoss:AddressObj;
    currentAddr:AddressObj;
    currentPhn:PhoneNumber;
    hasAtty:boolean;
    attyInfo:Types.IProfile;
  };
};
export type IUpcentricAdmin = Types.IProfile & {
  meta:{
    user:string;
    scopes:string[];
    rateAmt:number;
    rateUnit:"hr"|"attempt";
    mileageRate:number;
  };
};