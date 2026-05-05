import * as AUTH from "./auth.types";
import * as USER from "./user.types";
import * as TEMPLATES from "./notification-templates.types";

export enum INotificationStatuses {
  NEW = "new",
  SENDING = "sending",
  SENT = "sent",
  SENT_SOME = "sent-some",
  FAILED = "failed",
}
export type INotificationPre = {
  type:keyof typeof TEMPLATES.INotificationTemplates;
  method:AUTH.IContactMethods;
  audience:{
    user?:USER.IUser,
    info:string,
  }[];
  data?:any;
};

export enum INotificationActions {
  NOTIFICATION_ATTEMPT = 12,
  NOTIFICATION_SENT = 13,
  NOTIFICATION_FAILED = 14
};
export type INotificationMeta = {job: string;retries:number;};
export type INotificationType = DocEntity<INotificationStatuses> & INotificationPre & INotificationMeta;

export interface INotificationMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  json():Partial<INotification>;
};
export interface INotification extends INotificationType,INotificationMethods {}
export type INotificationQueryKeys = {
  strings:|"type"|"audience.user.username"|"meta.job";
  dates:|"created_on";
  geoNear:"location";
};
export type INotificationQuery = StrongQuery<INotificationQueryKeys>;