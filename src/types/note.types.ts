import * as Profiles from './profile.types';

export enum INoteStatuses {
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
export type INoteType<t extends string = "note"> = DocEntity<INoteStatuses,never> & {
  author:Profiles.IProfile;
  body:string;
  time:Date;
  type:t;
};
export interface INoteMethods {
  json():Partial<INote>;
}
export interface INote extends INoteType,INoteMethods {}

export type INoteQueryKeys = {
  strings:|"author.name"|"author.displayName"|"authorId"|"body"
  dates:|"time";
  geoNear:"location";
};
export type INoteQuery = StrongQuery<INoteQueryKeys>;