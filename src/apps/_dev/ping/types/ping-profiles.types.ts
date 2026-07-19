import Types from "@types";

export type IPingVendor = Types.IProfile & {
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
export type IPingUser = Types.IProfile & {
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
export type IPingAdmin = Types.IProfile & {
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