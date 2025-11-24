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
      const profileId = req.profile.id;
      const data = req.body.data;
      const {bug} = await BugsService.createBug(profileId,data);
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
      const data = req.body.data;
      const {bugId} = req.params;
      const {bug} = await BugsService.updateBug(bugId,data);
      res.locals.success = true;
      res.locals.data = bug.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteBug:IHandler = async (req,res,next) => {
    try {
      const {bugId} = req.params;
      const {ok} = await BugsService.deleteBug(bugId);
      res.locals.success = ok;
      res.locals.data = {removed:bugId,ok};
      next();
    } catch (e) { next(e); }
  };
  static createBugs:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {bugs} = await BugsService.createBugs(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:bugs.length,ok:true};
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
  
  // 📌 Bug Resolution & Invoicing
  static finalizeBug:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {bugId} = req.params;
      const {bug} = await BugsService.finalizeBug(bugId,data);
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