
export enum IDistrictLeadStatuses {
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
export type IDistrictLeadType = DocEntity<IDistrictLeadStatuses> & {
  name:string,
  region:number,
  county:string,
  studentCt:number,
  msSchoolCt:number,
  hsSchoolCt:number,
  infoAsOf:string,
  vendorInfo:{
    dept:string,
    contactName:string,
    contactEmail:string,
    contactPhn:string,
    role:string,
  }
};
export interface IDistrictLeadMethods {
  saveMe(status?:IDistrictLeadStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<IDistrictLead>;
}
export interface IDistrictLead extends IDistrictLeadType,IDistrictLeadMethods {}