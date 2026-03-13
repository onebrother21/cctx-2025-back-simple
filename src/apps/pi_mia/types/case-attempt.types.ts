import * as Profiles from "./profiles.types";
import Types from "@types";

export enum ICaseAttemptStatuses {
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
export type ICaseArtifactPre = Types.INote|ICaseStop|ICaseInterview|UploadResponse;
export type ICaseArtifact = Types.INote|ICaseStop|ICaseInterview|ICaseUpload;
export type ICaseAttemptType = DocEntity<ICaseAttemptStatuses,Profiles.ICaseAdmin> & {
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
export type ICaseAttemptITO = Partial<ICaseAttemptType>;
export type ICaseAttemptPTO = Pick<ICaseAttemptType,"id">;
export type ICaseAttemptOTO = Partial<ICaseAttemptType>;

export interface ICaseAttemptMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():ICaseAttemptOTO;
  preview():ICaseAttemptPTO;
};
export interface ICaseAttempt extends ICaseAttemptType,ICaseAttemptMethods {}
export type ICaseAttemptQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"client.name"|"client.displayName"|"clientId"
  |"vendor.name"|"vendor.displayName"|"vendorId"
  |"admin.name"|"admin.displayName"|"adminId"
  |"subjects.name"|"subjects.addrs.info"|"subjectId"
  |"status"|"desc"|"type"|"objective"|"resolution"
  ;
  dates:"created_on"|"start_on"|"due_on"|"assigned_on";
  geoNear:"subjectLoc";
};
export type ICaseAttemptQuery = StrongQuery<ICaseAttemptQueryKeys>;