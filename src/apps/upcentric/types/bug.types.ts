import * as Profiles from "./profile.types";
import * as Tasks from "./task.types";

export enum IBugStatuses {
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
export type IBugType = DocEntity & {
  title:string;
  lob:string;
  project:string;
  execAction:string;
  desc:string;
  meta:any;
  startOn:Date;
  dueOn:Date;
  priority:number;// 4, 3, 2, 1 - most crit
  amt?:number;
  progress?:number;
  recurring?:boolean;
  recurringInterval?:string;
  files:Attachment[];
  tasks:Tasks.ITask[];
  assignees:string;
  admin:Profiles.IUpcentricAdmin;
  resolution?:string;
  reason?:string;
};
export type IBugITO = Partial<IBug>;
export type IBugPTO = Pick<IBug,"id"|"title"|"project"|"desc"|"status">;
export type IBugOTO = Omit<Partial<IBug>,"tasks"> & {notes:IBug["log"];tasks:Tasks.ITaskPTO[];};
export interface IBugMethods {
  saveMe(o?:IBug["log"][0]):Promise<void>;
  populateMe():Promise<void>;
  json():IBugOTO;
  preview():IBugPTO;
};
export interface IBug extends IBugType,IBugMethods {}