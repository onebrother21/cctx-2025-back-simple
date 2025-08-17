import * as Profiles from "./profile.types";

export enum ITaskStatuses {
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
export type ITaskNote = {
  user:string;
  time:Date;
  msg:string;
}
export type ITaskType = DocEntity<ITaskStatuses> & {
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
  tasks:ITask[];
  notes:ITaskNote[];
  files:Attachment[];
  admin:Profiles.IUpcentricAdmin;
  resolution?:string;
  reason?:string;
};
export interface ITaskMethods {
  saveMe(status?:ITaskStatuses,info?:any):Promise<void>;
  populateMe():Promise<void>;
  json():Partial<ITask>;
  preview():Pick<ITask,"id"|"title"|"project"|"desc"|"status">;
};
export interface ITask extends ITaskType,ITaskMethods {}