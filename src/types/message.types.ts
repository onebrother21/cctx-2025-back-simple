import * as PROFILE from './profile.types';

export enum IReactions {
  HEART = "heart",
  LIKE = "like",
  DISLIKE = "dislike",
  FIRE = "fire",
  _100 = "100",
  HMM = "hmm",
  LMAO = "lmao",
  CRYING = "crying",
  DANG = "dang",
  NOPE = "nope",
  SAD = "sad",
  PRAYERS = "prayers",
  SHOCKED = "shocked"
}
export type IReaction = {
  user:PROFILE.IProfile;
  time:Date;
  type:IReactions;
}
export enum IMessageStatuses {
  NEW = "new",
  SAVED = "saved",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FLAGGED = "flagged",
  HIDDEN = "hidden",
}
export type IMessageTypes = "comment"|"private"|"inbox"|"post"|"live"|"note";
export type IMessageType = 
DocEntity<IMessageStatuses,PROFILE.IProfile,"author"> & {
  app:string;
  type:IMessageTypes;
  body:string;
  time:Date;
  title:string;
  subject:string;
  sender:string;
  senderEmail:string;
  recipient:string;
  replies:IMessage[];
  reactions:IReaction[];
  meta:{
    replyCt:number;
    reactionCt:number;
  };
};
export type IMessageJson = Partial<IMessage & Record<"author",PROFILE.IProfileJson>>;
export interface IMessageMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  preview():IMessageJson;
  json():IMessageJson;
}
export type IMessage = IMessageType & IMessageMethods;

export type IMessageQueryKeys = {
  strings:
  |`author.name`
  |`author.displayName`
  |`authorId`
  |"body"|"app"|"type";
  dates:|"time";
  geoNear:"location";
};
export type IMessageQuery = StrongQuery<IMessageQueryKeys>;