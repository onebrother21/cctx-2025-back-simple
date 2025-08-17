import Models from "../models";
import Types from "../types";
import Utils from '../utils';


const {NEW,FAILED} = Types.INotificationStatuses;

export class NotificationService {
  static createNotification = async (o:Types.INotificationPre) => {
    if (!o.audience.length) return; // Prevent errors if user ID is missing
    return await Models.Notification.create(o);
  };
  static getNotifications = async (userId:string) => {
    return await Models.Notification.find({"audience.user":userId});
  };
  static getNotificationsToProcess = async () => {
    const pipeline:any[]= [];
    pipeline.push(
      { $addFields: {
        status: {$arrayElemAt:["$statusUpdates.name",-1]}//last status update
      }},
      { $match: {status:{$in:[NEW,FAILED]}} },
      { $project: { _id: 0,id:"$_id",audience:1,method:1,data:1,type:1}}
    );
    const results = await Models.Notification.aggregate(pipeline);
    return results;
  }
  
  static replaceNotificationData = (template: string, data: Record<string, any>) => {
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  };
}