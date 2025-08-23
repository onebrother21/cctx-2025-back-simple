import * as Profiles from "./profile.types";

export enum ICaseStatuses {
  NEW = "new",
  ACTIVE = "active",
  ASSIGNED = "assigned",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  PENDING = "pending",
  CLOSED = "closed",
  REOPENED = "reopened",
  CANCELLED = "cancelled",
  PROCESSED = "processing",
  IN_PROGRESS = "in-progress"
}

export type ICaseDetails = {
  dateOfAccident:Date;
  vehicleDesc:string;
  ownerOfCar:string;
  subjectHousehold:Profiles.ICaseContact[];
  subjectInjuries:string;
  permissionToDrive:boolean;
  insurance:{
    user:string;
    exists:boolean;
    claimNo:string;
    adjuster:string;
  }[];
  police_reports:{
    incidentNo:string;
    precinct:string;
    submittedOn:Date;
    attainedOn:Date;
    officerName:string;
  }[];
  isMacpApp:boolean;
  isAffidavit:boolean;
  isProofOfService:string;
  isSignatureReq:boolean;
  isServiceReq:boolean;
  isNotaryReq:boolean;
  isQNAReq:boolean;
  
  macpAppCompleted:string|Date;
  affidavitSigned:Date;
  affidavitSent:Date;
  proofOfServiceAttained:string|Date;
  signatureAttained:string|Date;
  serviceRendered:string|Date;
  notaryCompleted:Date;
  qnaCompleted:Date;
  
  questions:string[];
  answers:string[];
};
export type ICaseNote = {
  type:"note";
  time:Date;
  body:string;
  user:string;
};
export type ICaseUpload = Pick<UploadResponse,"type"> & {
  id:string;
  url:string;
  time:Date;
  meta:Omit<UploadResponse,"type>">;
};
export type ICaseStop = {
  type:"stop";
  time:Date;
  subjectIdx:number,
  addrIdx:number,
  addr:string,
  loc:[number,number],
  meta:{
    verification:{atLoc:boolean,within:`${number} mi`,time:Date,hash:string};
    vehiclesPresent:{
      desc:string;
      plateNo:string;
      plateSt:string;
      vin:string;
      location:string;
      isMatch:boolean;
      isDamaged:boolean;
    }[];
    knockAndWait:boolean|number;
    leftMyLetter:boolean;
    leftAttyLetter:boolean;
    lastLetterLeftPresent:boolean;
  }
}
export type ICaseInterview = {
  type:"interview";
  time:Date;
  method:"in-person"|"call"|"sms"|"email"|"social";
  contact:Profiles.ICaseContact;
  meta:{
    refusedToSpeak:boolean;
    refusedToProvideInfo:boolean;
    leftMyLetter:boolean;
    leftAttyLetter:boolean;
    qnaCompleted:Date;
    affidavitSigned:Date;
  };
};
export type ICaseArtifactPre = ICaseStop|ICaseInterview|ICaseNote|UploadResponse;
export type ICaseArtifact = ICaseStop|ICaseInterview|ICaseNote|ICaseUpload;
export type ICaseAttempt = {
  start:Date;
  end:Date;
  log:ICaseArtifact[];
  outcome:string;
  meta:{
    mileage:number;
    mileageAdj:number;
    elapsedTime:number;
  };
};
export type ICaseInvoiceItem = {
  type:"attempt";
  desc:string;
  actions:string[];
  duration:string;
  durationStr:string;
  serviceCharges:number;
  serviceChg:string;
  mileage:number;
  mileageStr:string;
  mileageCharges:number;
  mileageChg:string;
  mileageAdj:number;
  mileageAdjStr:string;
  mileageAdjCharges:number;
  mileageAdjChg:string;
  totalCharges:number;
  totalChg:string;
};
export type ICaseInvoice = {
  caseId:string,
  invoiceNo:string,
  title:string;
  unit:Profiles.ICaseAdmin["meta"]["rateUnit"];
  items:ICaseInvoiceItem[];
  subtotal:number;
  tax:number;
  total:number;
  meta:Record<"submitted"|"sent"|"paid"|"received",Date>;
};
export type ICaseType = DocEntity<ICaseStatuses> & {
  reqNo:string;
  objective:"full"|"adoption"|"canvas"|"serivce";
  rush:boolean;
  dueOn:Date;
  assignedOn:Date;
  notes:ICaseNote[];
  meta:ICaseDetails;
  admin:Profiles.ICaseAdmin;
  vendor:Profiles.ICaseVendor;
  client:Profiles.ICaseClient;
  subjects:Profiles.ICaseSubject[];
  files:Attachment[];
  attempts:ICaseAttempt[];
  invoice:ICaseInvoice;
};
export interface ICaseMethods {
  saveMe(status?:ICaseStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<ICase>;
}
export interface ICase extends ICaseType,ICaseMethods {}