import * as PROFILES from "./profiles.types";
import * as CASE_UTILS from "./case-attempt.types";
import * as INVOICE from "./invoice.types";

import Types from "@types";

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
export type ICaseDetails = Partial<{
  dateOfAccident:Date;
  vehicleDesc:string;
  ownerOfCar:string;
  subjectHousehold:PROFILES.ICaseContact[];
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
  specialNotes:string;
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
}>;
export type ICaseType = DocEntity<ICaseStatuses,PROFILES.ICaseAdmin|PROFILES.ICaseClient> & {
  objective:"full"|"adoption"|"canvas"|"serivce";
  reqNo:string;
  rush:boolean;
  startOn:Date;
  dueOn:Date;
  assignedOn:Date;
  notes:Types.INote[];
  info:ICaseDetails;
  admin:PROFILES.ICaseAdmin;
  vendor:PROFILES.ICaseVendor;
  client:PROFILES.ICaseClient;
  subjects:PROFILES.ICaseSubject[];
  files:Attachment[];
  attempts:CASE_UTILS.ICaseAttempt[];
  invoice:INVOICE.IInvoice;
  resolution:string;
};

export type ICaseITO = Partial<ICaseType>;
export type ICasePTO = Pick<ICaseType,"id">;
export type ICaseOTO = Partial<ICaseType>;

export interface ICaseMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():ICaseOTO;
  preview():ICasePTO;
};
export interface ICase extends ICaseType,ICaseMethods {}

export type ICaseQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"client.name"|"client.displayName"|"clientId"
  |"vendor.name"|"vendor.displayName"|"vendorId"
  |"admin.name"|"admin.displayName"|"adminId"
  |"subjects.name"|"subjects.addrs.info"|"subjectId"
  |"status"|"desc"|"type"|"objective"|"resolution"
  ;
  dates:"created_on"|"start_on"|"due_on"|"assigned_on";
  geoNear:
  |"subject.contact.addrs.loc"|"client.contact.addrs.loc"
  |"vendor.contact.addrs.loc"|"admin.contact.addrs.loc";
};
export type ICaseQuery = StrongQuery<ICaseQueryKeys>;