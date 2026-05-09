import nodemailer from 'nodemailer';
import twilio from 'twilio';
import axios from 'axios';

import Utils from '@utils';
import Services from '@services';

export type INotificationReq = {
  from:{address:string,name:string},
  to:string[],
  subject:string,
  category:string,
  text?:string,
  html?:string,
  sandbox:boolean
};

//dummy func
const sendDummy = async (o:INotificationReq) => {
  await Utils.sleep(5);
  const id = Utils.longId();
  const sentAt = new Date();
  Utils.ok("send-email",{id,...o,sentAt});
  return {messageId:id};
};
const sendMailTrapEmailSMTP = async (o:INotificationReq) => {
  const transport = nodemailer.createTransport({
    host: process.env["MAILTRAP_SANDBOX_HOST"],
    port: Number(process.env["MAILTRAP_SANDBOX_PORT"]),
    auth: {
      user: process.env["MAILTRAP_SANDBOX_USER"],
      pass: process.env["MAILTRAP_SANDBOX_PSWD"],
    }
  });
  try {
    const resp = await transport.sendMail(o);
    const emailMessageId = resp.messageId;
    return { emailMessageId };
  }
  catch(e){
    Utils.error("send-email",e);
    throw new Error("Oops!");
  }
};
const sendMailTrapEmail = async (o:INotificationReq) => {
  const isProd = `MAILTRAP_${Utils.isProd()?"PROD":"DEV"}`;
  const token = process.env[`${isProd}_KEY`] || "";
  const inboxStr = process.env[`${isProd}_INBOX`] || ""
  const testInboxId = Number(inboxStr);
  const transport = nodemailer.createTransport(
    //MailtrapTransport({token,testInboxId})
  );

  const mailReq = {
    ...o,
    from:{address:'support@colorcoded.com',name:"ColorCoded Support"},
    to:Utils.isProd()?o.to:["service.onebrother@gmail.com"],
    sandbox:!Utils.isProd(),
  }
  Utils.ok("send-email",mailReq);
  try {
    const resp = await transport.sendMail(mailReq);
    //Utils.log(resp);
    return resp.messageId;
  }
  catch(e){
    Utils.error("send-email-mailtrap",e);
    return null;
  }
};
const sendEmail = async (o:INotificationReq) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });
  const info = await transporter.sendMail(o);
  return info.messageId;
};
const sendSMS = async (o:INotificationReq) => {
  const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
  const message = await client.messages.create({
    body:o.text,
    from: '+1234567890', // Your Twilio number
    to:o.to[0],
  });
  const smsId = message.sid;
  return { smsId };
};
const sendPushNotification = async (o:INotificationReq) => {
  const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
    to:o.to,
    notification: { title:o.subject, body:o.text },
  }, {
    headers: {
      Authorization: `Bearer YOUR_FCM_SERVER_KEY`,
    },
  });
  const pushResponse = response.data;
  return { pushResponse };
};
const sendInAppNotification = async (o:INotificationReq) => {
  const socket = Services.Sockets.getSocketByUserId(o.to[0]);
  if(!socket) throw "no socket found";
  socket.emit('notification',{ message:o.text });
  const socketInfo = {socketId:socket.id};
  return socketInfo;
};

export {
  sendDummy,
  sendSMS,
  sendPushNotification,
  sendInAppNotification,
  sendMailTrapEmail,
  sendMailTrapEmailSMTP,
  sendEmail,
};