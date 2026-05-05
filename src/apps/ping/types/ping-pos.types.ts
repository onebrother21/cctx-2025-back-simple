import * as PROFILES from "./ping-profiles.types";
import * as CARD from "./ping-card.types";

export enum IPingPosStatuses {
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
export type IPingPosType = DocEntity<IPingPosStatuses> & {
  posId:number;
  addr:AddressObj;
  owner:PROFILES.IPingVendor;
  pin:string;
}//display code when ready
export type IPingPosITO = Partial<IPingPosType>;
export type IPingPosPTO = Pick<IPingPosType,"id">;
export type IPingPosOTO = Partial<IPingPosType>;

export interface IPingPosMethods {
  enterAmount(amount:number):Promise<void>;
  waitForTap():Promise<void>;
  tap(card:CARD.IPingCard,amount:number):void;
  sendPayment():Promise<void>;
  waitForAuth():Promise<void>;
  authorize(pin:string,transId:string):Promise<void>;
  waitForComfirm():Promise<void>;
  confirm():Promise<void>;
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IPingPosOTO;
  preview():IPingPosPTO;
};
export interface IPingPos extends IPingPosType,IPingPosMethods {}

export type IPingPosQueryKeys = {
  strings:
    |"owner.name"|"owner.displayName"|"ownerId"
    |"status"|"desc"|"type"|"objective"|"resolution"
  ;
  numbers:"posId";
  dates:"created_on";
  geoNear:"addrLoc";
};
export type IPingPosQuery = StrongQuery<IPingPosQueryKeys>;