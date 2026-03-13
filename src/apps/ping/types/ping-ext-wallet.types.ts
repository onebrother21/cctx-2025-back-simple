import * as PROFILES from "./ping-profiles.types";

export enum IPingExtWalletStatuses {
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
export type IPingExtWalletType = DocEntity<IPingExtWalletStatuses,never> & {
  walletId:number;
  name:string;
  platform:string;
  addr:string;
  type:"hot"|"cold";
  balances:Record<string,number>;
  owner:PROFILES.IPingUser|PROFILES.IPingVendor;
}//display code when ready
export type IPingExtWalletITO = Partial<IPingExtWalletType>;
export type IPingExtWalletPTO = Pick<IPingExtWalletType,"id">;
export type IPingExtWalletOTO = Partial<IPingExtWalletType>;

export interface IPingExtWalletMethods {
  initialize(amount:number,currency:string):Promise<void>;
  makePayment(amount:number,currency:string,toAddr:string):Promise<string>;
  getPayments():Promise<string>;
  getBalance():Promise<Record<string,number>>;
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IPingExtWalletOTO;
  preview():IPingExtWalletPTO;
};
export type IPingExtWallet = IPingExtWalletType & IPingExtWalletMethods;
export type IPingExtWalletQueryKeys = {
  strings:
  |"owner.name"|"owner.displayName"|"ownerId"
  |"status"|"desc"|"type"|"name"|"platform"|"addr"
  ;
  numbers:"walletId"|`balances.${string}`;
  dates:"created_on";
};
export type IPingExtWalletQuery = StrongQuery<IPingExtWalletQueryKeys>;