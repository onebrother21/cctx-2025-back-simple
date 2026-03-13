import { CCTXTasksService } from './tasks.service';
import { CCTXTasksQueriesService } from './tasks-queries.service';

import Types from "@types";
import Utils from '@utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CCTXTasksController { 
  // 📌 CCTXTask CRUD Ops
  static queryCCTXTasks:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await CCTXTasksQueriesService.queryCCTXTasks(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static createCCTXTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {task} = await CCTXTasksService.createCCTXTask(profileId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static createCCTXTasks:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {tasks} = await CCTXTasksService.createCCTXTasks(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:tasks.length,ok:true};
      next();
    } catch (e) { next(e); }
  };
  static getCCTXTaskById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {task} = await CCTXTasksService.getCCTXTaskById(profileId,taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static updateCCTXTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await CCTXTasksService.updateCCTXTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteCCTXTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {ok} = await CCTXTasksService.deleteCCTXTask(profileId,taskId);
      res.locals.success = ok;
      res.locals.data = {removed:taskId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateCCTXTaskStatus:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const statusUpdates = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await CCTXTasksService.updateCCTXTaskStatus(taskId,statusUpdates);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static addUpdateToCCTXTask:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const updateType = req.params.updateType as "note";
      const data = req.body.data;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await CCTXTasksService.addUpdateToCCTXTask(taskId,updateType,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static removeUpdateToCCTXTask:IHandler = async (req,res,next) => {
    try {
      const taskId = req.params.taskId;
      const updateType = req.params.updateType as "note";
      const itemIdx = req.params.itemIdx;
      if(!taskId) throw new Utils.AppError(422,'Requested parameters not found');
      const {task} = await CCTXTasksService.removeUpdateFromCCTXTask(taskId,updateType,Number(itemIdx));
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeCCTXTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {taskId} = req.params;
      const {task} = await CCTXTasksService.finalizeCCTXTask(profileId,taskId,data);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  static closeCCTXTask:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {taskId} = req.params;
      const {task} = await CCTXTasksService.closeCCTXTask(taskId);
      res.locals.success = true;
      res.locals.data = task.json();
      next();
    } catch (e) { next(e); }
  };
  // 📌 CCTXTask Queries
  static queryCCTXTaskDescriptions:IHandler = async (req,res,next) => {
     try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await CCTXTasksQueriesService.queryDescriptions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}