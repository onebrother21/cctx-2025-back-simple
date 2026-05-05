import MsgChainsService from './msgs.service';
import MsgChainsQueries from './msgs-queries.service';

import Types from "@types";
import Utils from '@utils';

export class MsgChainsController {
  static createMsgChain:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {msgChain} = await MsgChainsService.createMsgChain(profileId,data);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static createMsgChains:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {msgChains} = await MsgChainsService.createMsgChains(profileId,items);
      res.locals.success = true;
      res.locals.data = {results:msgChains.map(t => t.json())};
      next();
    } catch (e) { next(e); }
  };
  static getMsgChainById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {msgChainId} = req.params as Record<string,string>;
      const {msgChain} = await MsgChainsService.getMsgChainById(profileId,msgChainId);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static updateMsgChain:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const msgChainId = req.params.msgChainId as string;
      const data = req.body.data;
      const {msgChain} = await MsgChainsService.updateMsgChain(profileId,msgChainId,data);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteMsgChain:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const msgChainId = req.params.msgChainId as string;
      const {ok} = await MsgChainsService.deleteMsgChain(profileId,msgChainId);
      res.locals.success = ok;
      res.locals.data = {removed:msgChainId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateMsgChainStatus:IHandler = async (req,res,next) => {
    try {
      const msgChainId = req.params.msgChainId as string;
      const statusUpdates = req.body.data;
      if(!msgChainId) throw new Utils.AppError(422,'Requested parameters not found');
      const {msgChain} = await MsgChainsService.updateMsgChainStatus(msgChainId,statusUpdates);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static addMsgToMsgChain:IHandler = async (req,res,next) => {
    try {
      const msgChainId = req.params.msgChainId as string;
      const msgInfo = req.body.data;
      if(!msgChainId) throw new Utils.AppError(422,'Requested parameters not found');
      const {msgChain} = await MsgChainsService.addMsgToMsgChain(msgChainId,msgInfo);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static removeMsgToMsgChain:IHandler = async (req,res,next) => {
    try {
      const msgChainId = req.params.msgChainId as string;
      const msgIdx = req.params.msgIdx;
      if(!msgChainId) throw new Utils.AppError(422,'Requested parameters not found');
      const {msgChain} = await MsgChainsService.removeMsgFromMsgChain(msgChainId,Number(msgIdx));
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static closeMsgChain:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const msgChainId = req.params.msgChainId as string;
      const {msgChain} = await MsgChainsService.closeMsgChain(msgChainId);
      res.locals.success = true;
      res.locals.data = msgChain.json();
      next();
    } catch (e) { next(e); }
  };
  static queryMsgChains:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await MsgChainsQueries.queryMsgChains(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryMsgChainDescriptions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await MsgChainsQueries.queryDescriptions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}