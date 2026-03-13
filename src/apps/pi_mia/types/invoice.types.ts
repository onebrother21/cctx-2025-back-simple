import * as PROFILES from "./profiles.types";
import Types from "@types";

export enum IInvoiceStatuses {
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
export type IInvoiceItem = {
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
export type IInvoiceType = DocEntity<IInvoiceStatuses,PROFILES.ICaseAdmin> & {
  caseId:string;
  invoiceNo:string;
  title:string;
  unit:PROFILES.ICaseAdmin["info"]["rateUnit"];
  items:IInvoiceItem[];
  subtotal:number;
  tax:number;
  total:number;
  addressee:PROFILES.ICaseClient|PROFILES.ICaseVendor;
  meta:Record<"submitted"|"sent"|"paid"|"received",Date>;
};

export type IInvoiceITO = Partial<IInvoiceType>;
export type IInvoicePTO = Pick<IInvoiceType,"id">;
export type IInvoiceOTO = Partial<IInvoiceType>;

export interface IInvoiceMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IInvoiceOTO;
  preview():IInvoicePTO;
};
export interface IInvoice extends IInvoiceType,IInvoiceMethods {}

export type IInvoiceQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"status"|"desc"|"caseId"|"invoiceNo"|"title"
  ;
  numbers:"invoiceNo"|"subtotal"|"tax"|"total";
  dates:"created_on"|"meta.sent_on"|"meta.paid_on";
  any:"items";
};
export type IInvoiceQuery = StrongQuery<IInvoiceQueryKeys>;