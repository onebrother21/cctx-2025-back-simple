import { TasksService } from '../tasks/tasks.service';
import { BugsService } from './bugs.service';
import { BugsQueriesService } from './bugs-queries.service';

import Types from "../../../../types";
import Utils from '../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class BugsController { 
  // 📌 Bug Profile CRUD Ops
  static createProfile:IHandler = async (req,res,next) => {
    try {
      const {profile} = await BugsService.createProfile(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  // 📌 Bug CRUD Ops
  static createBug:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-bug",req.body.data);
      const {bug} = await BugsService.createBug(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static getBugById:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {bug} = await BugsService.getBugById(bugId);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static updateBug:IHandler = async (req,res,next) => {
    try {
      const {bug} = await BugsService.updateBug(req.params.bugId,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteBug:IHandler = async (req,res,next) => {
    try {
      const {ok} = await BugsService.deleteBug(req.params.bugId);
      res.locals.success = ok;
      res.locals.data = {removed:req.params.bugId,ok};
      next();
    } catch (e) { next(e); }
  };
  // Bug Tasks CRUD Ops
  static addTaskToBug:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-bug",req.body.data);
      const {bug} = await BugsService.addTaskToBug(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static updateBugTask:IHandler = async (req,res,next) => {
    try {
      const {bugId,taskIdx} = req.params;
      const {bug} = await BugsService.updateBugTask(bugId,Number(taskIdx),req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static removeTaskFromBug:IHandler = async (req,res,next) => {
    try {
      const {bugId,taskIdx} = req.params;
      const {bug} = await BugsService.removeTaskFromBug(bugId,Number(taskIdx));
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };

  
  // 📌 Bug Queries
  static queryBugs:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await BugsQueriesService.queryBugs(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryProfiles:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await BugsQueriesService.queryProfiles(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };

  // 📌 Bug AddOns & Assignment
  static assignAdminToBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {admin} = req.body.data;
      if(!bugId) throw new Utils.AppError(422,'Requested parameters not found');
      const {bug} = await BugsService.assignAdminToBug(bugId,admin);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static unassignAdminFromBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      if(!bugId) throw new Utils.AppError(422,'Requested parameters not found');
      const {bug} = await BugsService.unassignAdminFromBug(bugId);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static updateBugStatus:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      Utils.trace(req.profile,req.user)
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {bug} = await BugsService.updateBugStatus(admin,bugId,data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static addFilesToBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {files} = req.body.data;
      if(!bugId) throw new Utils.AppError(422,'Requested parameters not found');
      const {bug} = await BugsService.addFilesToBug(bugId,files);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static assignDetailsToBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {details} = req.body.data;
      if(!bugId) throw new Utils.AppError(422,'Requested parameters not found');
      const {bug} = await BugsService.addDetailsToBug(bugId,details);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  
  // 📌 Bug Notation
  static addNotes:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {bug} = await BugsService.addNotes(bugId,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static updateNote:IHandler = async (req,res,next) => {
    try {
      const {bugId,noteIdx} = req.params;
      const {bug} = await BugsService.updateNote(bugId,Number(noteIdx),req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static removeNote:IHandler = async (req,res,next) => {
    try {
      const {bugId,noteIdx} = req.params;
      const {bug} = await BugsService.removeNote(bugId,Number(noteIdx));
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };

  /*
  // 📌 Bug Attempts
  static startAttempt:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {bug} = await BugsService.startAttempt(bugId,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static updateAttempt:IHandler = async (req,res,next) => {
    try {
      const {bug} = await BugsService.updateAttempt(req.params.bugId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeAttempt:IHandler = async (req,res,next) => {
    try {
      const {bugId,attemptIndex} = req.params;
      const attemptData = req.body.data;
      const {bug} = await BugsService.finalizeAttempt(bugId,Number(attemptIndex),attemptData);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttempt:IHandler = async (req,res,next) => {
    try {
      const {bug} = await BugsService.removeAttempt(req.params.bugId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };

  // 📌 Bug Artifacts - Stops, Interviews, Uploads and Notes
  static addAttemptActivity:IHandler = async (req,res,next) => {
    try {
      let data:any;
      if(req.file && req.file.path){
        const filePath = req.file.path as string;
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          resource_type: 'auto', // auto-detect image/audio/video
          folder: 'your_app_media'
        }) as any;
        fs.unlinkSync(filePath);
        data = {...uploadRes,...req.body};
      }
      else data = req.body.data;
      const {bugId,attemptIndex} = req.params;
      const {bug} = await BugsService.addAttemptActivity(bugId,Number(attemptIndex),data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttemptActivity:IHandler = async (req,res,next) => {
    try {
      const {bugId,attemptIndex,itemIdx} = req.params;
      const {bug} = await BugsService.removeAttemptActivity(bugId,Number(attemptIndex),Number(itemIdx));
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  */

  // 📌 Bug Resolution & Invoicing
  static finalizeBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {bug} = await BugsService.finalizeBug(bugId,req.body.data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static closeBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {bug} = await BugsService.closeBug(bugId);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
}