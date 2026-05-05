import * as PROFILE from './profile.types';
import * as MESSAGE from './message.types';

export enum IMsgChainStatuses {
  NEW = "new",
  ACTIVE = "active",
  INACTIVE = "inactive",
}
export type IMsgChainTypes = "channel"|"private";
export type IMsgChainType = 
DocEntity<IMsgChainStatuses,PROFILE.IProfile> & {
  users:PROFILE.IProfile[];
  msgs:MESSAGE.IMessage[];
  name:string;
  type:IMsgChainTypes;
  app:string;
  img?:ImageObj;
  desc?:string;
};
export type IMsgChainJson = Partial<Omit<IMsgChain,"img"> & {
  msgs:MESSAGE.IMessageJson[];
  userCt:number;
  img:string;
}>;
export interface IMsgChainMethods {
  saveMe():Promise<void>;
  populateMe():Promise<void>;
  preview():IMsgChainJson;
  json():IMsgChainJson;
}
export interface IMsgChain extends IMsgChainType,IMsgChainMethods {}

export type IMsgChainQueryKeys = {
  strings:
  |"creator.name"|"creator.displayName"|"creatorId"
  |"users.name"|"users.displayName"|"userId"|"name"
  dates:|"created_on";
  geoNear:"location";
};
export type IMsgChainQuery = StrongQuery<IMsgChainQueryKeys>;