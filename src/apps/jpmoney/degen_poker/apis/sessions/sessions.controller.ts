import { DegenSessionsService } from './sessions.service';
import { DegenSessionsQueriesService } from './sessions-queries.service';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

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
  static getDegenSessionById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.getDegenSessionById(profileId,sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static updateDegenSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.updateDegenSession(profileId,sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteDegenSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {sessionId} = req.params;
      const {ok} = await DegenSessionsService.deleteDegenSession(profileId,sessionId);
      res.locals.success = ok;
      res.locals.data = {removed:sessionId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateDegenSessionStatus:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId;
      const status = req.body.data.status;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.updateDegenSessionStatus(sessionId,status);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static addUpdateToDegenSession:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId;
      const updateType = req.params.updateType as "ledger"|"note"|"hand";
      const data = req.body.data;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.addUpdateToDegenSession(sessionId,updateType,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static removeUpdateToDegenSession:IHandler = async (req,res,next) => {
    try {
      const sessionId = req.params.sessionId;
      const updateType = req.params.updateType as "ledger"|"note"|"hand";
      const itemIdx = req.params.itemIdx;
      if(!sessionId) throw new Utils.AppError(422,'Requested parameters not found');
      const {session} = await DegenSessionsService.removeUpdateFromDegenSession(sessionId,updateType,Number(itemIdx));
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeDegenSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.finalizeDegenSession(profileId,sessionId,data);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  static closeDegenSession:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {sessionId} = req.params;
      const {session} = await DegenSessionsService.closeDegenSession(profileId,sessionId);
      res.locals.success = true;
      res.locals.data = session.json();
      next();
    } catch (e) { next(e); }
  };
  // 📌 DegenSession Queries
  static queryDegenSessions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenSessionsQueriesService.queryDegenSessions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryDegenSessionDescriptions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenSessionsQueriesService.queryDescriptions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}