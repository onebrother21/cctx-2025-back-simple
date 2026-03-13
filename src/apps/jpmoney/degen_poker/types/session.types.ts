import * as Profiles from "./profiles.types";
import * as Venues from "./venue.types";

import Types from "@types";

export enum IDegenSessionStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CLOSED = "closed",
}
export type IDegenSessionType = DocEntity<IDegenSessionStatuses,Profiles.IDegenPlayer> & {
  venue:Venues.IDegenVenue;
  desc:string;
  type:"C"|"T";
  dateOfPlay:Date;
  startTime:TimeToTheNearestFive;
  endTime:TimeToTheNearestFive;
  ledger:{
    time:Date;
    amt:number;
    reason:string;
  }[];
  notes:Types.INote[];
  hands:any[];
  info:{
    startingStack?:string;
    place?:number|"DNP";
  };
  meta:{
    score:number;
  };
  player:Profiles.IDegenPlayer;
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

export type IDegenSessionQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"player.name"|"player.displayName"|"playerId"
  |"venue.name"|"venue.addr.info"|"venueId"
  |"status"|"desc"|"type"|"ledger.reason"
  |`info.${keyof IDegenSession["info"]}`;
  numbers:"ledger.amt"|"meta.score";
  dates:"created_on"|"play_date";
  geoNear:"venue.addr.loc";
};
export type IDegenSessionQuery = StrongQuery<IDegenSessionQueryKeys>;
