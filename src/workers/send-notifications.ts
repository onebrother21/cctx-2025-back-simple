import { Job } from 'bullmq';
import Models from '../models';
import Services from "../services";
import Types from "../types";
import Utils from '../utils';
import * as SendMethods from "./send-notification-helpers";

import fs from "fs";
import path from "path";

const Notification = Models.Notification;
const AppUsage = Models.AppUsage;
const {SENDING,SENT,FAILED} = Types.INotificationStatuses;

export const sendNotifications = async (job:Job) => {
  const notificationsToProcess = await Services.Notifications.getNotificationsToProcess();
  for(const o of notificationsToProcess) {
    const notification = await Notification.findById(o.id);
    notification.status = SENDING;
    await notification.saveMe();
    await AppUsage.make("sys-admn","attemptToSendNotifications");
    const template = Types.INotificationTemplates[o.type];
    const to = o.audience.map((m:Types.INotification["audience"][0]) => m.info);
    const subject = o.type.replace("_"," ");
    const category = "Integration Test";
    const from = {address:'support@colorcoded.com',name:"ColorCoded Support"};
    const sandbox = !Utils.isProd();

    let meta:any,html:string = "";
    try {
      html = await new Promise((done,reject) => {
        const dir = path.join(__dirname,"../../",`public/templates/${template}.html`);
        fs.readFile(dir,'utf8',(err,data) => {
          if(err) reject(err);
          done(data);
        });
      });
      html = Services.Notifications.replaceNotificationData(html,o.data);
      const requestBody = {from,to,subject,category,html,sandbox};

      switch (o.method){
        case 'email':{
          const emailMessageId = await SendMethods.sendMailTrapEmailSMTP(requestBody);
          if(!emailMessageId) throw new Error("Oops!");
          else meta = { emailMessageId };
          break;
        }
        /*
          case 'sms':
            const smsSid = await SendMethods.sendDummy(requestBody);
            meta = { smsSid };
            break;
          case 'push':
            const pushResponse = await SendMethods.sendDummy(requestBody);
            meta = { pushResponse };
            break;
          case 'in-app':
            await SendMethods.sendDummy(requestBody);
            meta = { socketId: requestBody.to };
            break;
          case 'auto':
            try {
              await SendMethods.sendDummy(requestBody);
              meta = { socketId: requestBody.to };
            } 
            catch (err) {
              // If WebSocket fails, fallback to push
              const pushResponse = await SendMethods.sendDummy(requestBody);
              meta = { pushResponse };
            }
            break;
          default:throw new Error('Unknown notification method');
        */
      }
      notification.meta = meta;
      notification.status = SENT;
      await notification.saveMe();
      await AppUsage.make("sys-admn","sentNotifications");
      return { ok: true };
    }
    catch (error) {
      console.error('Error processing notification:', error);
      notification.status = FAILED;
      await notification.saveMe();
      await AppUsage.make("sys-admn","failedToSendNotifications");
      throw error;
    }
  }
  return { ok: true,count:notificationsToProcess.length };
};
export default sendNotifications;