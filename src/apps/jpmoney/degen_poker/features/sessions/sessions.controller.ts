import { DegenSessionsService } from './sessions.service';
import { DegenSessionsQueriesService } from './sessions-queries.service';

import Types from "../../../../../types";
import Utils from '../../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class DegenSessionsController { 
  // 📌 DegenSession CRUD Ops
  static createDegenSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {session} = await DegenSessionsService.createDegenSession(profileId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static getDegenSessionById:IHandler = async (req,res,next) => {
    try {
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.getDegenSessionById(sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static updateDegenSession:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.updateDegenSession(sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteDegenSession:IHandler = async (req,res,next) => {
    try {
      const {sessionId} = req.params;
      const {ok} = await DegenSessionsService.deleteDegenSession(sessionId);
      res.locals.success = ok;
      res.locals.data = {removed:sessionId,ok};
      next();
    } catch (e) { next(e); }
  };
  static createDegenSessions:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {sessions} = await DegenSessionsService.createDegenSessions(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:sessions.length,ok:true};
      next();
    } catch (e) { next(e); }
  };

  
  // 📌 DegenSession Queries
  static queryDegenSessions:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenSessionsQueriesService.queryDegenSessions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static updateDegenSessionStatus:IHandler = async (req,res,next) => {
    try {
      const {sessionId} = req.params;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {session} = await DegenSessionsService.updateDegenSessionStatus(admin,sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  /*
  static addFilesToDegenSession:IHandler = async (req,res,next) => {
    try {
      const {sessionId} = req.params;
      const {files} = req.body.data;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.addFilesToDegenSession(sessionId,files);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  */
  
  static finalizeDegenSession:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.finalizeDegenSession(sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static closeDegenSession:IHandler = async (req,res,next) => {
    try {
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.closeDegenSession(sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
}