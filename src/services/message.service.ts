import { Schema } from "mongoose";
import Models from "../models";
import Types from "../types";
import Utils from '../utils';
import { NotificationService } from "./notification.service";

export class MessageService {
  static createMessage = async (user:Types.IUser,recipients_:MiscModelRef[],content:string) => {
    const role = user.role;
    const profile = user.profiles[role] as any;
    const sender = profile.id,senderRef = role + "s";
    // allow sending messages to oneself but prevent addressee and 
    // notification duplication by pruning the sender from "recipients"
    const recipients = recipients_.filter(r => r.id !== sender).map(r => r.id);
    const recipientRefs = recipients_.filter(r => r.id !== sender).map(r => r.ref);
    const chat = new Models.Chat({
      participants: [sender,...recipients],
      participantRefs: [senderRef,...recipientRefs],
      messages: []
    });
    await chat.save();
    const message = new Models.Message({ chat:chat._id,sender,senderRef,content });
    await message.save();
    chat.messages.push(message);
    chat.lastMessage = message;
    await chat.populate('participants messages');
    await chat.save();
    const userRecipients:string[] = [];
    chat.participants.forEach((profile:any) => {
      if(profile.user) userRecipients.push(profile.user);
      else userRecipients.push(...[profile.mgr,...profile.users]);
    });
    const notificationMethod = Types.INotificationSendMethods.PUSH;
    const notificationData = {name:profile.name};
    await NotificationService.createNotification("CHAT_INVITE",notificationMethod,userRecipients,notificationData);
    return { chat };
  }
  static getMessages = async (userId:string) => {
    return await Models.Message.find({audience:userId});
  };
}