import * as Profiles from "./profile.types";

export enum ITaskStatuses {
  NEW = "new",
  PLANNED = "planned",
  PLANNED_PENDING = "planned-pending",
  UPLANNED = "unplanned",
  OPEN = "open",
  REOPENED = "reopened",
  IN_PROGRESS = "in-progress",
  STALLED = "stalled",
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
  CLOSED = "closed",
}
export type ITaskType = DocEntity & {
  title:string;
  desc:string;
  meta:any;
  lob:string;
  project:string;
  execAction:string;
  startOn:Date;
  dueOn:Date;
  priority:number;// 4, 3, 2, 1 - most crit
  amt?:number;
  progress?:number;
  recurring?:boolean;
  recurringInterval?:string;
  resolution?:string;
  reason?:string;
  files:Attachment[];
  tasks:ITask[];
  assignees:string;
  admin:Profiles.IUpcentricAdmin;
};
export type ITaskITO = Partial<ITask>;
export type ITaskPTO = Pick<ITask,"id"|"title"|"project"|"desc"|"status"|"priority">;
export type ITaskOTO = Omit<Partial<ITask>,"tasks"> & {notes:ITask["log"];tasks:ITaskPTO[];};
export interface ITaskMethods {
  saveMe(o?:ITask["log"][0]):Promise<void>;
  populateMe():Promise<void>;
  json():ITaskOTO;
  preview():ITaskPTO;
};
export interface ITask extends ITaskType,ITaskMethods {}