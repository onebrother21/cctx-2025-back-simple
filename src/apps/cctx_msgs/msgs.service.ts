import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { QueryOptions } from "mongoose";

const notify = Services.Notifications.createNotification;

const queryOpts:QueryOptions = { returnDocumechainInfo:"after",runValidators: true,cochainInfoext:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage,MsgChain,Message} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class MsgChainsService {
  static createMsgChains = async (creator:string,newCCTXMsgChains:Partial<Types.IMsgChain>[]) => {
    const msgChains:Types.IMsgChain[] = [];
    const oneWk = 7 * 24 * 60 * 60 * 1000;
    for(let i = 0,l = newCCTXMsgChains.length;i<l;i++){
      const chainInfo = {
        creator,
        users:[creator],
        msgs:[],
        info:{},
        meta:{},
        ...newCCTXMsgChains[i]
      };
      const msgChain = new MsgChain(chainInfo);
      await msgChain.saveMe();
      msgChains.push(msgChain);
    }
    await AppUsage.make(`prf/${creator}`,"createdMsgChains");
    return {msgChains};
  };
  static createMsgChain = async (creator:string,newCCTXMsgChain:Partial<Types.IMsgChain>) => {
    const msgChain = new MsgChain({
      creator,
      users:[creator],
      msgs:[],
      info:{},
      meta:{},
      ...newCCTXMsgChain
    });
    await msgChain.saveMe();
    await AppUsage.make(`prf/${creator}`,"createdMsgChain",{which:`tsk/${msgChain.id}`});
    return {msgChain};
  };
  static getMsgChainById = async (creator:string,msgChainId:string) => {
    const msgChain = await MsgChain.findById(msgChainId);
    if(!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    await msgChain.populateMe();
    await AppUsage.make(`prf/${creator}`,"fetchMsgChain",{which:`tsk/${msgChain.id}`});
    return {msgChain};
  };
  static updateMsgChain = async (
    creator:string,
    msgChainId:string,
    {msgs,users,...updates}:Partial<Types.IMsgChain>) => {
    const msgChain = await MsgChain.findByIdAndUpdate(msgChainId,{$set:updates},queryOpts);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    await msgChain.populateMe();
    await AppUsage.make(`prf/${creator}`,"updatedMsgChain",{which:`tsk/${msgChain.id}`});
    return {msgChain};
  };
  static deleteMsgChain = async (creator:string,msgChainId:string) => {
    const msgChain = await MsgChain.findByIdAndDelete(msgChainId);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    await AppUsage.make(`prf/${creator}`,"deletedMsgChain",{which:`tsk/${msgChain.id}`});
    return {ok:true};
  };
  static updateMsgChainStatus = async (msgChainId:string,{status,reason}:Partial<{
    status:Types.IMsgChainStatuses,
    reason:string,
  }>) => {
    const $set = {
      ...status?{status}:{},
      ...reason?{reason}:{},
    };
    const msgChain = await MsgChain.findByIdAndUpdate(msgChainId,{$set},queryOpts);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    await msgChain.populateMe();
    return {msgChain};
  };
  static addMsgToMsgChain = async (msgChainId:string,msgInfo:Partial<Types.IMessage>) => {
    const msg = new Message(msgInfo);
    await msg.saveMe();
    const msgChain = await MsgChain.findByIdAndUpdate(msgChainId,{$push:{msgs:[msg]}},queryOpts);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    await msgChain.populateMe();
    return {msgChain};
  };
  static removeMsgFromMsgChain = async (msgChainId:string,j:number) => {
    const msgChain = await MsgChain.findById(msgChainId);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    msgChain.msgs = msgChain.msgs.filter((o,i) => i !== j);
    await msgChain.saveMe();
    return {msgChain};
  };
  static closeMsgChain = async (msgChainId:string) => {
    const msgChain = await MsgChain.findById(msgChainId);
    if (!msgChain) throw new Utils.AppError(422,'Requested msgChain not found');
    
    await msgChain.saveMe();
    await AppUsage.make(`sys-admn`,"closedMsgChain",{which:`tsk/${msgChain.id}`});
    return {msgChain};
  };
}
export default MsgChainsService;