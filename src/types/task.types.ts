import * as Profiles from "./profile.types";
import * as Notes from "./note.types";

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
  STALLED = "stalled",
  UPLANNED = "unplanned",
}
export type ITaskType = DocEntity<ITaskStatuses,Profiles.IProfile> & {
  app:string;
  type:"bug"|"improvement"|"suggestion"|"other";
  title:string;
  desc:string;
  tasks:ITask[];
  notes:Notes.INote[];
  admin:Profiles.IProfile|null;
  priority:1|2|3|4,
  progress:number;
  resolution?:string;
  reason?:string;
  startOn:Date;
  dueOn:Date;
  info:{
    lob:"tech"|"corp";
    platform:"client"|"server"|"worker"|"dev-ops"|"live-opts";
    platformType:"app-front"|"app-back"|"third-party";
    platformName?:string;
    feature:string;
    recurring?:boolean;
    recurringInterval?:string;
    amt?:number;
    cost?:number;
  }
  meta:{
    assigned:Date;
    completed:Date;
    cancelled:Date;
    rejected:Date;
  }
};

export type ITaskITO = Partial<ITaskType>;
export type ITaskPTO = Pick<ITaskType,"id">;
export type ITaskOTO = Partial<ITaskType>;

export interface ITaskMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():ITaskOTO;
  preview():ITaskPTO;
};
export interface ITask extends ITaskType,ITaskMethods {}

export type ITaskQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"admin.name"|"admin.displayName"|"adminId"
  |"app"|"type"|"title"|"desc"|"status"
  |`info.${keyof ITask["info"]}`;
  numbers:"amt"|"progress"|"priority";
  dates:
  |"created_on"|"start_on"|"due_on"
  |"completed"|"cancelled"|"rejected"|"assigned";
  geoNear:"location";
};
export type ITaskQuery = StrongQuery<ITaskQueryKeys>;