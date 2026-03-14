import TasksService from './tasks.service';
import TasksQueries from './tasks-queries.service';

import Types from "@types";
import Utils from '@utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class TasksController {
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
  static getTaskById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {task} = await TasksService.getTaskById(profileId,taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await TasksService.updateTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {ok} = await TasksService.deleteTask(profileId,taskId);
      res.locals.success = ok;
      res.locals.data = {removed:taskId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateTaskStatus:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const statusUpdates = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.updateTaskStatus(taskId,statusUpdates);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static addUpdateToTask:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const updateType = req.params.updateType as "note";
      const data = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.addUpdateToTask(taskId,updateType,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static removeUpdateToTask:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const updateType = req.params.updateType as "note";
      const itemIdx = req.params.itemIdx;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await TasksService.removeUpdateFromTask(taskId,updateType,Number(itemIdx));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await TasksService.finalizeTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static closeTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {task} = await TasksService.closeTask(taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static queryTasks:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await TasksQueries.queryTasks(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryTaskDescriptions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await TasksQueries.queryDescriptions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}