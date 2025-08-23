import { TasksService } from './tasks.service';
import { TasksQueriesService } from './tasks-queries.service';

import Types from "../../../../types";
import Utils from '../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class TasksController { 
  // 📌 Task Profile CRUD Ops
  static createProfile:IHandler = async (req,res,next) => {
    try {
      const {profile} = await TasksService.createProfile(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  // 📌 Task CRUD Ops
  static createTask:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-task",req.body.data);
      const {task} = await TasksService.createTask(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static getTaskById:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {task} = await TasksService.getTaskById(taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateTask:IHandler = async (req,res,next) => {
    try {
      const {task} = await TasksService.updateTask(req.params.taskId,req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteTask:IHandler = async (req,res,next) => {
    try {
      const {ok} = await TasksService.deleteTask(req.params.taskId);
      res.locals.success = ok;
      res.locals.data = {removed:req.params.taskId,ok};
      next();
    } catch (e) { next(e); }
  };

  
  // 📌 Task Queries
  static queryTasks:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await TasksQueriesService.queryTasks(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryProfiles:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await TasksQueriesService.queryProfiles(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };

  // 📌 Task AddOns & Assignment
  static assignAdminToTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {admin} = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.assignAdminToTask(taskId,admin);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static unassignAdminFromTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.unassignAdminFromTask(taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateTaskStatus:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      Utils.trace(req.profile,req.user)
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {task} = await TasksService.updateTaskStatus(admin,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static addFilesToTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {files} = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.addFilesToTask(taskId,files);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static assignDetailsToTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {details} = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.addDetailsToTask(taskId,details);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  
  // 📌 Task Notation
  static addNotes:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {task} = await TasksService.addNotes(taskId,req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateNote:IHandler = async (req,res,next) => {
    try {
      const {taskId,noteIdx} = req.params;
      const {task} = await TasksService.updateNote(taskId,Number(noteIdx),req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static removeNote:IHandler = async (req,res,next) => {
    try {
      const {taskId,noteIdx} = req.params;
      const {task} = await TasksService.removeNote(taskId,Number(noteIdx));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };

  /*
  // 📌 Task Attempts
  static startAttempt:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {task} = await TasksService.startAttempt(taskId,req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateAttempt:IHandler = async (req,res,next) => {
    try {
      const {task} = await TasksService.updateAttempt(req.params.taskId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeAttempt:IHandler = async (req,res,next) => {
    try {
      const {taskId,attemptIndex} = req.params;
      const attemptData = req.body.data;
      const {task} = await TasksService.finalizeAttempt(taskId,Number(attemptIndex),attemptData);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttempt:IHandler = async (req,res,next) => {
    try {
      const {task} = await TasksService.removeAttempt(req.params.taskId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };

  // 📌 Task Artifacts - Stops, Interviews, Uploads and Notes
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
      const {taskId,attemptIndex} = req.params;
      const {task} = await TasksService.addAttemptActivity(taskId,Number(attemptIndex),data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttemptActivity:IHandler = async (req,res,next) => {
    try {
      const {taskId,attemptIndex,itemIdx} = req.params;
      const {task} = await TasksService.removeAttemptActivity(taskId,Number(attemptIndex),Number(itemIdx));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  */

  // 📌 Task Resolution & Invoicing
  static finalizeTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {task} = await TasksService.finalizeTask(taskId,req.body.data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static closeTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {task} = await TasksService.closeTask(taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
}