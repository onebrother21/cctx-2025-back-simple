export enum ISubscriptionStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
  CLOSED = "closed",
  REOPENED = "reopened",
  CANCELLED = "cancelled",
  PROCESSED = "processing",
  IN_PROGRESS = "in-progress"
}
export type ISubscriptionNote = {
  user:string;
  time:Date;
  msg:string;
}
export type ISubscriptionType = DocEntity<ISubscriptionStatuses> & { 
  dueOn:string|Date;
  category:string;
  type:string;
  name:string;
  description?:string;
  amt?:number;
  progress?:number;
  recurring?:boolean;
  recurringInterval?:string;
  notes:ISubscriptionNote[];
  resolution?:string;
  reason?:string;
};
export interface ISubscriptionMethods {
  setStatus(name:ISubscriptionStatuses,info?:any,save?:boolean):Promise<void>;
  preview():Pick<ISubscription,"id"|"name"|"category"|"type"|"description"|"status">;
  json():Partial<ISubscription>;
}
export interface ISubscription extends ISubscriptionType,ISubscriptionMethods {}