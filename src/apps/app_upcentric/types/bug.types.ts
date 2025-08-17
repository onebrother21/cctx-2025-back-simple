import * as Profiles from "./profile.types";

export enum IBugStatuses {
  NEW = "new",
  ACTIVE = "active",
  OPEN = "open",
  OPEN_CRIT = "open-crit",
  IN_PROGRESS = "in-progress",
  IN_PROGRESS_CRIT = "in-progress-crit",
  PENDING = "pending",
  PENDING_CRIT = "pending-crit",
  PLANNED = "planned",
  PLANNED_PENDING = "planned-pending",
  COMPLETED = "completed",
  CLOSED = "closed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
  REOPENED = "reopened",
}
export type IBugNote = {
  user:string;
  time:Date;
  msg:string;
}
export type IBugType = DocEntity<IBugStatuses> & {
  startOn:Date;
  dueOn:Date;
  assignedOn:Date;
  completedOn:Date;
  title:string;
  lob:string;
  project:string;
  execAction:string;
  desc:string;
  amt?:number;
  progress?:number;
  recurring?:boolean;
  recurringInterval?:string;
  bugs:IBug[];
  notes:IBugNote[];
  files:Attachment[];
  admin:Profiles.IUpcentricAdmin;
  resolution?:string;
  reason?:string;
};
export interface IBugMethods {
  saveMe(status?:IBugStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<IBug>;
  preview():Pick<IBug,"id"|"title"|"project"|"desc"|"status">;
};
export interface IBug extends IBugType,IBugMethods {}