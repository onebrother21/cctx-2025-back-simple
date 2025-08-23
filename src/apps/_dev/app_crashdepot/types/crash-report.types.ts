export enum ICrashReportStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CLOSED = "closed",
  REOPENED = "reopened",
  CANCELLED = "cancelled",
  PROCESSED = "processing",
  IN_PROGRESS = "in-progress"
}
export type ICrashReportNote = {
  user:string;
  time:Date;
  msg:string;
}
export type ICrashReportType = DocEntity<ICrashReportStatuses> & {
  type:"browser"|"mobile-app"|"service";
  name:string;
  desc:string;
  tags:string[];
  notes:ICrashReportNote[];
  resolution?:string;
  reason?:string;
};
export interface ICrashReportMethods {
  setStatus(name:ICrashReportStatuses,info?:any,save?:boolean):Promise<void>;
  json():Partial<ICrashReport>;
}
export interface ICrashReport extends ICrashReportType,ICrashReportMethods {}