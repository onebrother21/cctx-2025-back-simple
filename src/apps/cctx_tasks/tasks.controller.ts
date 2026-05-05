import TasksService from './tasks.service';
import TasksQueries from './tasks-queries.service';

import Types from "@types";
import Utils from '@utils';

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
      res.locals.data = {results:tasks.map(t => t.json())};
      next();
    } catch (e) { next(e); }
  };
  static getTaskById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params as Record<string,string>;
      const {task} = await TasksService.getTaskById(profileId,taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const taskId = req.params.taskId as string;
      const data = req.body.data;
      const {task} = await TasksService.updateTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const taskId = req.params.taskId as string;
      const {ok} = await TasksService.deleteTask(profileId,taskId);
      res.locals.success = ok;
      res.locals.data = {removed:taskId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateTaskStatus:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId as string;
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
      const taskId = req.params.taskId as string;
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
      const taskId = req.params.taskId as string;
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
      const taskId = req.params.taskId as string;
      const data = req.body.data;
      const {task} = await TasksService.finalizeTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static closeTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const taskId = req.params.taskId as string;
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