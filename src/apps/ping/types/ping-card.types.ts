import * as PROFILES from "./ping-profiles.types";

export enum IPingCardStatuses {
  NEW = "new",
  ENABLED = "enabled",
  DISABLED = "disabled",
  ON = "on",
  OFF = "off",
  ONLINE = "online",
  OFFLINE = "offline",
  INIT = "init",
  OK = "connected",
  ERR = "error",
}
export type IPingCardType = DocEntity<IPingCardStatuses,never> & {
  cardId:number;
  cardNo:string;
  expiry:string;
  cvv:string;
  link:string;
  owner:PROFILES.IPingUser;
}//display code when ready
export type IPingCardITO = Partial<IPingCardType>;
export type IPingCardPTO = Pick<IPingCardType,"id">;
export type IPingCardOTO = Partial<IPingCardType>;

export interface IPingCardMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IPingCardOTO;
  preview():IPingCardPTO;
};
export interface IPingCard extends IPingCardType,IPingCardMethods {}

export type IPingCardQueryKeys = {
  strings:
  |"owner.name"|"owner.displayName"|"ownerId"
  |"status"|"desc"|"cardNo"|"expiry"|"name";
  numbers:"cardId";
  dates:"created_on";
};
export type IPingCardQuery = StrongQuery<IPingCardQueryKeys>;
