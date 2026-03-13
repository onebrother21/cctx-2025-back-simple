import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {DegenSession} = DegenModels;
const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class DegenSessionsService {
  // 📌 DegenSession CRUD Ops
  static createDegenSessions = async (creator:string,newDegenSessions:Partial<DegenTypes.IDegenSession>[]) => {
    const sessions:DegenTypes.IDegenSession[] = [];
    for(let i = 0,l = newDegenSessions.length;i<l;i++){
      const nt = {creator,...newDegenSessions[i]};
      const session = new DegenSession(nt);
      await session.saveMe();
      sessions.push(session);
    }
    await AppUsage.make(`prf/${creator}`,"createdSessions");
    return {sessions};
  };
  static createDegenSession = async (creator:string,newDegenSession:DegenTypes.IDegenSessionITO) => {
    const session = new DegenSession({
      creator,
      meta:{},
      ledger:[],
      notes:[],
      hands:[],
      ...newDegenSession
    });
    await session.saveMe();
    await AppUsage.make(`prf/${creator}`,"createdSession",{which:`ssn/${session.id}`});
    return {session};
  };
  static getDegenSessionById = async (creator:string,sessionId:string) => {
    const session = await DegenSession.findById(sessionId);
    if(!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    await AppUsage.make(`prf/${creator}`,"fetchSession",{which:`ssn/${session.id}`});
    return {session};
  };
  static updateDegenSession = async (
    creator:string,
    sessionId:string,
    {notes,hands,ledger,...updates}:Partial<DegenTypes.IDegenSession>) => {
    const session = await DegenSession.findByIdAndUpdate(sessionId,{$set:updates},queryOpts);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    await AppUsage.make(`prf/${creator}`,"updatedSession",{which:`ssn/${session.id}`});
    return {session};
  };
  static deleteDegenSession = async (creator:string,sessionId:string) => {
    const session = await DegenSession.findByIdAndDelete(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await AppUsage.make(`prf/${creator}`,"deletedSession",{which:`ssn/${session.id}`});
    return {ok:true};
  };
  static updateDegenSessionStatus = async (
    sessionId:string,
    status:DegenTypes.IDegenSessionStatuses) => {
    const session = await DegenSession.findByIdAndUpdate(sessionId,{$set:{status}},queryOpts);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    return {session};
  };
  static addUpdateToDegenSession = async (
    sessionId:string,
    type:"ledger"|"note"|"hand",
    item:
    DegenTypes.IDegenSession["ledger"][0]|
    DegenTypes.IDegenSession["hands"][0]|
    DegenTypes.IDegenSession["notes"][0]
    ) => {
    const type_ = type == "ledger"?type:`${type}s` as "ledger"|"notes"|"hands";
    const session = await DegenSession.findByIdAndUpdate(sessionId,{$push:{[type_]:item}},queryOpts);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    await session.populateMe();
    return {session};
  };
  static removeUpdateFromDegenSession = async (sessionId:string,type:"ledger"|"note"|"hand",j:number) => {
    const type_ = type == "ledger"?type:`${type}s` as "ledger"|"notes"|"hands";
    const session = await DegenSession.findById(sessionId);
    if (!session) throw new Utils.AppError(422,'Requested session not found');
    session[type_] = session[type_].filter((o,i) => i !== j) as any[];
    await session.saveMe();
    return {session};
  };
  // 📌 DegenSession Resolution & Invoicing
  static finalizeDegenSession = async (creator:string,sessionId:string,{status,reason,resolution}:{
    status:DegenTypes.IDegenSessionStatuses,
    resolution:string,//Partial<Types.IDegenSessionDetails>,
    reason:string}) => {
    const session = await DegenSession.findById(sessionId);
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
  static closeDegenSession = async (creator:string,sessionId:string) => {
    const session = await DegenSession.findById(sessionId);
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