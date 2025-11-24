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
      const profileId = req.profile.id;
      const data = req.body.data;
      const {task} = await TasksService.createTask(profileId,data);
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
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await TasksService.updateTask(taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteTask:IHandler = async (req,res,next) => {
    try {
      const {taskId} = req.params;
      const {ok} = await TasksService.deleteTask(taskId);
      res.locals.success = ok;
      res.locals.data = {removed:taskId,ok};
      next();
    } catch (e) { next(e); }
  };
  static createTasks:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {tasks} = await TasksService.createTasks(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:tasks.length,ok:true};
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
  
  // 📌 Task Resolution & Invoicing
  static finalizeTask:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await TasksService.finalizeTask(taskId,data);
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