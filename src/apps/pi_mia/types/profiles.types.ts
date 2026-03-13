import Types from "@types";

export type ICaseClient = Types.IProfile & {info:{billableMax:number;}};
export type ICaseVendor = Types.IProfile & {info:{oboName:string;oboPhn:string}};
export type ICaseContact = Types.IProfile & {info:{ref:string;rel:string}};
export type ICaseSubject = Types.IProfile & {
  info:{
    type:"primary"|"secondary";
    addrOnDateOfLoss:AddressObj;
    currentAddr:AddressObj;
    currentPhn:PhoneNumber;
    hasAtty:boolean;
    attyInfo:ICaseVendor;
  };
};
export type ICaseAdmin =Types.IProfile & {
  info:{
    rateAmt:number;
    rateUnit:"hr"|"attempt";
    mileageRate:number;
  }
  meta:{
    user:string;
  };
  settings:{
    includeReturnHmOnAttempts:boolean;
  };
};