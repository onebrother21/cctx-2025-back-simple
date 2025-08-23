import * as Profiles from "./profile.types";
import * as Tasks from "./task.types";

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
  tasks:Tasks.ITask[];
  notes:IBugNote[];
  files:Attachment[];
  admin:Profiles.IUpcentricAdmin;
  resolution?:string;
  reason?:string;
};
export type IBugITO = Partial<IBug>;
export type IBugPTO = Pick<IBug,"id"|"title"|"project"|"desc"|"status">;
export type IBugOTO = Omit<Partial<IBug>,"tasks"> & {tasks:Tasks.ITaskPTO[]};
export interface IBugMethods {
  saveMe(status?:IBugStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():IBugOTO;
  preview():IBugPTO;
};
export interface IBug extends IBugType,IBugMethods {}