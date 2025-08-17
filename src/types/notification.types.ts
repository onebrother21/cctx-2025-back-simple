import * as Users from "./user.types";
import * as Templates from "./notification-templates.types";

export enum INotificationStatuses {
  NEW = "new",
  SENDING = "sending",
  SENT = "sent",
  SENT_SOME = "sent-some",
  FAILED = "failed",
}
export type INotificationPre = {
  type:keyof typeof Templates.INotificationTemplates;
  method:Users.IContactMethods;
  audience:{
    user?:Users.IUser,
    info:string,
  }[];
  data?:any; // Replaceable data for personalization
};
export type INotificationMeta = {job: string;retries:number;};
export type INotificationType = DocEntity<INotificationStatuses> & INotificationPre & INotificationMeta;

export interface INotificationMethods {
  setStatus(name:INotificationStatuses,info?:any,save?:boolean):Promise<void>;
  json():Partial<INotification>;
};
export interface INotification extends INotificationType,INotificationMethods {}