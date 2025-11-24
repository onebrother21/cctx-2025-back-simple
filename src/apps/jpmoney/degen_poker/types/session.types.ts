import {IDegenPokerAdmin} from "./profile.types";

export enum IDegenSessionStatuses {
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
export type IDegenSessionNote = {
  user:IDegenPokerAdmin;
  time:Date;
  msg:string;
}
export type IDegenSessionType = DocEntity & {
  project:string;
  venue:string;
  host?:string;
  desc:string;
  type:"cash"|"tourney";
  start:Date;
  end:Date;
  buyin:number;
  reloads:{time:Date,amt:number;}[];
  payout:number;
  notes:IDegenSessionNote[];
};
export type IDegenSessionITO = Partial<IDegenSessionType>;
export type IDegenSessionPTO = Pick<IDegenSessionType,"id">;
export type IDegenSessionOTO = Partial<IDegenSessionType>;

export interface IDegenSessionMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IDegenSessionOTO;
  preview():IDegenSessionPTO;
};
export interface IDegenSession extends IDegenSessionType,IDegenSessionMethods {}