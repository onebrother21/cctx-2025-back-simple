import { Job } from 'bullmq';

import Models from '@models';
import Services from "@services";
import Types from "@types";
import Utils from '@utils';

import * as SendMethods from "./send-notification-helpers";

const Notification = Models.Notification;
const AppUsage = Models.AppUsage;
const {SENDING,SENT,FAILED} = Types.INotificationStatuses;

export const sendNotifications = async (job:Job) => {
  const notificationsToProcess = await Services.Notifications.getNotificationsToProcess();
  const stats = { updated:0,count:notificationsToProcess.length };
  const processNotification = async (o:Types.INotification) => {
    try {
      const notification = await Notification.findById(o.id);
      if(!notification) throw "no notification";

      notification.status = SENDING;
      await notification.saveMe();
      await AppUsage.make("sys-admn","attemptToSendNotifications");


      const to = o.audience.map((m:Types.INotification["audience"][0]) => m.info);
      const subject = o.type.replace("_"," ");
      const category = "Identity Managememt";
      const from = {address:'support@colorcoded.com',name:"ColorCoded Support"};
      const sandbox = !Utils.isProd();
      const template = await Utils.loadHtmlTemplateAsString(o.type);
      const text = template?Services.Notifications.replaceNotificationData(template,o.data):null;
      if(!text) throw {status:400,message:'no notification template found'};

      const requestBody:SendMethods.INotificationReq = {from,to,subject,category,sandbox};
      o.method == Types.IContactMethods.EMAIL?requestBody.html = text:requestBody.text = text;
      let meta:any;

      switch (true){
        case o.method == 'email' && Utils.isEnv("dev-live"):meta = await SendMethods.sendMailTrapEmailSMTP(requestBody);break;
        case o.method == 'email':meta = await SendMethods.sendEmail(requestBody);break;
        case o.method == 'sms':meta = await SendMethods.sendSMS(requestBody);break;
        case o.method == 'push':meta = await SendMethods.sendPushNotification(requestBody);break;
        case o.method == 'in-app':meta = await SendMethods.sendInAppNotification(requestBody);break;
        case o.method == 'auto':{
          try {
            meta = await SendMethods.sendInAppNotification(requestBody);
          }
          catch(e){
            meta = await SendMethods.sendPushNotification(requestBody);
          }
          break;
        }
        default:throw new Error('Unknown notification method');
      }
      notification.meta = meta;
      notification.status = SENT;
      await notification.saveMe();
      stats.updated++;
    }
    catch(e:any){
      //job.failedReason = e.message;
      Utils.error('send-notifications.worker',e);
      o.status = FAILED;
      await o.saveMe();
    }
  }
  let i = 0;
  do {
    await processNotification(notificationsToProcess[i]);
    i++;
  }
  while(i < notificationsToProcess.length);
  return stats;
};
export default sendNotifications;