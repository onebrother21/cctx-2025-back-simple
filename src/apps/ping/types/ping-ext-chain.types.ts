import * as TRANSACTION from "./ping-transaction.types";

export enum IPingExtChainStatuses {
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
export type IPingExtChainType = DocEntity<IPingExtChainStatuses> & {
  chainId:number;
  items:TRANSACTION.IPingTransaction[];
}
export type IPingExtChainITO = Partial<IPingExtChainType>;
export type IPingExtChainPTO = Pick<IPingExtChainType,"id">;
export type IPingExtChainOTO = Partial<IPingExtChainType>;

export interface IPingExtChainMethods {
  initialize():Promise<void>;
  logTransaction(o:TRANSACTION.IPingTransaction):Promise<string>;
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IPingExtChainOTO;
  preview():IPingExtChainPTO;
};
export interface IPingExtChain extends IPingExtChainType,IPingExtChainMethods {}
export type IPingExtChainQueryKeys = {
  numbers:"chainId";
  dates:"created_on";
};
export type IPingExtChainQuery = StrongQuery<IPingExtChainQueryKeys>;