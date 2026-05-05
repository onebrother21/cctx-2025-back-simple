import DegenSessionsService from './sessions.service';
import DegenSessionsQueries from './sessions-queries.service';

import Utils from '@utils';

export class DegenSessionsController {
  static createSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {session} = await DegenSessionsService.createSession(profileId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static createSessions:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {sessions} = await DegenSessionsService.createSessions(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:sessions.length,ok:true};
      next();
    } catch (e) { next(e); }
  };
  static getSessionById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const sessionId = req.params.sessionId as string;
      const {session} = await DegenSessionsService.getSessionById(profileId,sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static updateSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const sessionId = req.params.sessionId as string;
      const data = req.body.data;
      const {session} = await DegenSessionsService.updateSession(profileId,sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const sessionId = req.params.sessionId as string;
      const {ok} = await DegenSessionsService.deleteSession(profileId,sessionId);
      res.locals.success = ok;
      res.locals.data = {removed:sessionId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateSessionStatus:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId as string;
      const status = req.body.data.status;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.updateSessionStatus(sessionId,status);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static addUpdateToSession:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId as string;
      const updateType = req.params.updateType as "ledger"|"note"|"hand";
      const data = req.body.data;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.addUpdateToSession(sessionId,updateType,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static removeUpdateToSession:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId as string;
      const updateType = req.params.updateType as "ledger"|"note"|"hand";
      const itemIdx = req.params.itemIdx;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.removeUpdateFromSession(sessionId,updateType,Number(itemIdx));
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const sessionId = req.params.sessionId as string;
      const data = req.body.data;
      const {session} = await DegenSessionsService.finalizeSession(profileId,sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static closeSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const sessionId = req.params.sessionId as string;
      const {session} = await DegenSessionsService.closeSession(profileId,sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static querySessions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenSessionsQueries.querySessions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryDescriptions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenSessionsQueries.queryDescriptions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}