
import nodemailer from 'nodemailer';
import { MailtrapTransport } from "mailtrap";
import twilio from 'twilio';
import axios from 'axios';
import Utils from '../utils';
import { getUserSocket } from '../init/sockets';

//dummy func
const sendDummy = async ({from = 'support@colorcoded.com',to,subject,text}:Record<string,string>) => {
  await Utils.sleep(5);
  const id = Utils.longId();
  const sentAt = new Date();
  Utils.ok({id,from,to,subject,text,sentAt});
  return id;
};
// Function for sending email

// Looking to send emails in production? Check out our Email API/SMTP product!

type InotificationReq = {
  from:{address:string,name:string},
  to:string[],
  subject:string,
  category:string,
  html:string,
  sandbox:boolean
};
const sendMailTrapEmailSMTP = async (o:InotificationReq) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5ff7693d5260e6",
      pass: "b81277f7cfa005"
    }
  });
  try {
    const resp = await transport.sendMail(o);
    return resp.messageId;
  }
  catch(e){
    Utils.error(e);
    return null;
  }
};
const sendMailTrapEmail = async (o:Record<string,string> & {to:string[]}) => {
  const isProd = `MAILTRAP_${Utils.isProd()?"PROD":"DEV"}`;
  const token = process.env[`${isProd}_KEY`] || "";
  const inboxStr = process.env[`${isProd}_INBOX`] || ""
  const testInboxId = Number(inboxStr);
  const transport = nodemailer.createTransport(MailtrapTransport({token,testInboxId}));

  const mailReq = {
    ...o,
    from:{address:'support@colorcoded.com',name:"ColorCoded Support"},
    to:Utils.isProd()?o.to:["service.onebrother@gmail.com"],
    sandbox:!Utils.isProd(),
  }
  Utils.ok(mailReq);
  try {
    const resp = await transport.sendMail(mailReq);
    Utils.log(resp);
    return resp.success;
  }
  catch(e){
    Utils.error(e);
    return null;
  }
};
// Function for sending email
const sendEmail = async ({from = 'support@colorcoded.com',to,subject,text}:Record<string,string>) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });
  const info = await transporter.sendMail({from,to,subject,text});
  return info.messageId;
};
// Function for sending SMS
const sendSMS = async (to: string, body: string) => {
  const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
  const message = await client.messages.create({
    body,
    from: '+1234567890', // Your Twilio number
    to,
  });
  return message.sid;
};
// Function for sending push notifications
const sendPushNotification = async (to: string, title: string, body: string) => {
  const response = await axios.post('https://fcm.googleapis.com/fcm/send', {
    to,
    notification: { title, body },
  }, {
    headers: {
      Authorization: `Bearer YOUR_FCM_SERVER_KEY`,
    },
  });

  return response.data;
};
// Function for sending in-app notifications (using Socket.io for this example)
const sendInAppNotification = async (to:string, message: string) => {
  const socket = getUserSocket(to);
  if(!socket) throw "no socket found";
  socket.emit('notification',{ message });
  return {socketId:socket.id};
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