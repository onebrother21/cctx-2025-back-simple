import * as PROFILES from "./profiles.types";
import * as VENUE from "./venue.types";

import Types from "@types";

export enum IDegenSessionStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CLOSED = "closed",
}
export type IDegenSessionType = {
  venue:VENUE.IDegenVenue;
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
  notes:Types.IMessage[];
  hands:any[];
  info:{
    startingStack?:string;
    place?:number|"DNP";
  };
  meta:{
    score:number;
  };
  player:PROFILES.IDegenPlayer;
};
export type IDegenSessionObj = DocEntityObj<IDegenSessionType,IDegenSessionStatuses,PROFILES.IDegenPlayer>;
export type IDegenSessionITO = Partial<IDegenSessionObj>;
export type IDegenSessionPTO = Partial<IDegenSessionObj>;// Pick<"id"|"venue"|"dateOfPlay">;
export type IDegenSessionOTO = Partial<IDegenSessionObj & {notes:Types.IMessageJson[]}>;
export type IDegenSession = DocEntity<IDegenSessionObj,IDegenSessionOTO,IDegenSessionPTO>;

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
