export enum IPingTransactionStatuses {
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
export type IPingTransactionType = DocEntity<IPingTransactionStatuses> & {
  payer:string;
  payee:string;
  amount:number;
  currency:string;
  timestamp:Date;
  txId:string;
  type:"payment"|"init"
}
export type IPingTransactionITO = Partial<IPingTransactionType>;
export type IPingTransactionPTO = Pick<IPingTransactionType,"id">;
export type IPingTransactionOTO = Partial<IPingTransactionType>;

export interface IPingTransactionMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():IPingTransactionOTO;
  preview():IPingTransactionPTO;
};
export interface IPingTransaction extends IPingTransactionType,IPingTransactionMethods {}
export type IPingTransactionQueryKeys = {
  strings:|"payee"|"payer"|"type"|"txId"|"currency";
  numbers:"amount";
  dates:"created_on"|"time_stamp";
};
export type IPingTransactionQuery = StrongQuery<IPingTransactionQueryKeys>;