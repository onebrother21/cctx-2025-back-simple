import JPMoneyModels from "../../models";
import JPMoneyTypes from "../../types";

import Models from "../../../../../models";
import Types from "../../../../../types";
import Utils from '../../../../../utils';
import Services from '../../../../../services';



const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class DegenSessionsService {
  // 📌 DegenSession CRUD Ops
  static createDegenSessions = async (creator:string,newDegenSessions:Partial<JPMoneyTypes.IDegenSession>[]) => {
    const sessions:JPMoneyTypes.IDegenSession[] = [];
    for(let i = 0,l = newDegenSessions.length;i<l;i++){
      const nt = {creator,...newDegenSessions[i]};
      const session = new JPMoneyModels.DegenSession(nt);
      await session.saveMe();
      sessions.push(session);
    }
    return {sessions};
  };
  static createDegenSession = async (creator:string,newDegenSession:JPMoneyTypes.IDegenSessionITO) => {
    const session = new JPMoneyModels.DegenSession({creator,meta:{},...newDegenSession});
    await session.saveMe();
    return {session};
  };
  static getDegenSessionById = async (sessionId:string) => {
    const session = await JPMoneyModels.DegenSession.findById(sessionId);
    if(!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    return {session};
  };
  static updateDegenSession = async (sessionId:string,{notes,...updates}:any) => {
    const session = await JPMoneyModels.DegenSession.findByIdAndUpdate(sessionId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    return {session};
  };
  static deleteDegenSession = async (sessionId:string) => {
    const session = await JPMoneyModels.DegenSession.findByIdAndDelete(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    return {ok:true};
  };


  // DegenSession Updates
  static updateDegenSessionStatus = async (
    admin:string,
    sessionId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const session = await JPMoneyModels.DegenSession.findById(sessionId);
    if(!session) throw new Utils.AppError(422,'Requested session not found');
    await session.saveMe();
    return {session};
  };
  /*
  static addFilesToDegenSession = async (sessionId:string,files:JPMoneyTypes.IDegenSession["files"]) => {
    const session = await JPMoneyModels.DegenSession.findByIdAndUpdate(sessionId,
      { $push: { files }},
      { new: true, runValidators: true } // Ensure validators are run
    );
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    return {session};
  };
  static removeFileFromDegenSession = async (sessionId:string,fileIdx:number) => {
    const session = await JPMoneyModels.DegenSession.findById(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    session.files = session.files.filter((o,i) => i !== fileIdx);
    await session.saveMe();
    return {session};
  };
  */
  // 📌 DegenSession Resolution & Invoicing
  static finalizeDegenSession = async (sessionId:string,{status,reason,resolution}:{
    status:JPMoneyTypes.IDegenSessionStatuses,
    resolution:string,//Partial<Types.IDegenSessionDetails>,
    reason:string}) => {
    const session = await JPMoneyModels.DegenSession.findById(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    
    const update = {
      status,
      action:`status changed to '${status}'`,
      user:"sys-admn",
      time:new Date()
    };
    //session.invoice = DegenSessionsService.generateInvoice(session);
    await session.saveMe();
    return {session};
  };
  static closeDegenSession = async (sessionId:string) => {
    const session = await JPMoneyModels.DegenSession.findById(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    //if (session.status == CLOSED || !session.invoice.meta.paid) throw new Utils.AppError(422,'Requested session cannot be closed');
    
    const update = {
      //status:approvalStats.CLOSED,
      //action:`status changed to '${profileStats.CLOSED}'`,
      user:"sys-admn",
      time:new Date()
    };
    await session.saveMe();
    return {session};
  };
}