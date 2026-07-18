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
export type IInvoiceType = {
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
export type IInvoiceObj = DocEntityObj<IInvoiceType,IInvoiceStatuses,PROFILES.ICaseAdmin>;
export type IInvoiceITO = Partial<IInvoiceObj>;
export type IInvoicePTO = Pick<IInvoiceObj,"id">;
export type IInvoiceOTO = Partial<IInvoiceObj>;
export type IInvoice = DocEntity<IInvoiceObj,IInvoiceOTO,IInvoicePTO>;

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