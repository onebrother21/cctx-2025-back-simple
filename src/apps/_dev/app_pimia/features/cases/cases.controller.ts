import { CasesService } from './cases.service';
import Types from "../../../../types";
import Utils from '../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CasesController {
  // 📌 Case CRUD Ops
  static createCase:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-case",req.body.data);
      const {case_} = await CasesService.createCase(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static getCaseById:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {case_} = await CasesService.getCaseById(caseId);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static updateCase:IHandler = async (req,res,next) => {
    try {
      const {case_} = await CasesService.updateCase(req.params.caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteCase:IHandler = async (req,res,next) => {
    try {
      const {ok} = await CasesService.deleteCase(req.params.caseId);
      res.locals.success = ok;
      res.locals.data = {removed:req.params.caseId,ok};
      next();
    } catch (e) { next(e); }
  };

  // 📌 Case Profile CRUD Ops
  static createProfile:IHandler = async (req,res,next) => {
    try {
      const {profile} = await CasesService.createProfile(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  
  // 📌 Case Queries
  static queryCases:IHandler = async (req,res,next) => {
    try{
      const {q,s,o,t} = JSON.parse(req.query.q as string);
      const data = await CasesService.queryCases(q,s,o,t);
      res.locals = {success:true,data};
      next();
    } catch(e) { next(e); }
  };
  static queryProfiles:IHandler = async (req,res,next) => {
    try{
      const {q,s,o,t} = JSON.parse(req.query.q as string);
      const data = await CasesService.queryProfiles(q,s,o,t);
      res.locals = {success:true,data};
      next();
    } catch(e) { next(e); }
  };
  static queryInvoices:IHandler = async (req,res,next) => {
    try{
      const {q,s,o,t} = JSON.parse(req.query.q as string);
      const data = await CasesService.queryInvoices(q,s,o,t);
      res.locals = {success:true,data};
      next();
    } catch(e) { next(e); }
  };

  // 📌 Case AddOns & Assignment
  static updateCaseStatus:IHandler = async (req,res,next) => {
    try {
      const {case_} = await CasesService.updateCaseStatus(req.params.caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static addSubjectsToCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {subjects} = req.body.data;
      if(!caseId) throw new Utils.AppError(422,'Requested parameters not found');
      const {case_} = await CasesService.addSubjectsToCase(caseId,subjects);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static updateSubject:IHandler = async (req,res,next) => {
    try {
      const {caseId,subjectIdx} = req.params;
      const {case_} = await CasesService.updateSubject(caseId,Number(subjectIdx),req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static removeSubjectFromCase:IHandler = async (req,res,next) => {
    try {
      const {caseId,subjectIdx} = req.params;
      const {case_} = await CasesService.removeSubjectFromCase(caseId,Number(subjectIdx));
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static addSubjectAddresses:IHandler = async (req,res,next) => {
    try {
      const {caseId,subjectIndex} = req.params;
      if(!(caseId && subjectIndex)) throw new Utils.AppError(422,'Requested parameters not found');
      const {addresses} = req.body.data;
      const {case_} = await CasesService.addSubjectAddresses(caseId,Number(subjectIndex),addresses);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static addFilesToCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {files} = req.body.data;
      if(!caseId) throw new Utils.AppError(422,'Requested parameters not found');
      const {case_} = await CasesService.addFilesToCase(caseId,files);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static addDetailsToCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      if(!caseId) throw new Utils.AppError(422,'Requested parameters not found');
      const {case_} = await CasesService.addDetailsToCase(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static assignAdminToCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {admin} = req.body.data;
      if(!caseId) throw new Utils.AppError(422,'Requested parameters not found');
      const {case_} = await CasesService.assignAdminToCase(caseId,admin);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  
  // 📌 Case Notation
  static addNotes:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {case_} = await CasesService.addNotes(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static updateNote:IHandler = async (req,res,next) => {
    try {
      const {caseId,noteIdx} = req.params;
      const {case_} = await CasesService.updateNote(caseId,Number(noteIdx),req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static removeNote:IHandler = async (req,res,next) => {
    try {
      const {caseId,noteIdx} = req.params;
      const {case_} = await CasesService.removeNote(caseId,Number(noteIdx));
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };

  // 📌 Case Attempts
  static startAttempt:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {case_} = await CasesService.startAttempt(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static updateAttempt:IHandler = async (req,res,next) => {
    try {
      const {case_} = await CasesService.updateAttempt(req.params.caseId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static finalizeAttempt:IHandler = async (req,res,next) => {
    try {
      const {caseId,attemptIndex} = req.params;
      const attemptData = req.body.data;
      const {case_} = await CasesService.finalizeAttempt(caseId,Number(attemptIndex),attemptData);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttempt:IHandler = async (req,res,next) => {
    try {
      const {case_} = await CasesService.removeAttempt(req.params.caseId,Number(req.params.attemptIndex));
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };

  // 📌 Case Artifacts - Stops, Interviews, Uploads and Notes
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
      const {caseId,attemptIndex} = req.params;
      const {case_} = await CasesService.addAttemptActivity(caseId,Number(attemptIndex),data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static removeAttemptActivity:IHandler = async (req,res,next) => {
    try {
      const {caseId,attemptIndex,itemIdx} = req.params;
      const {case_} = await CasesService.removeAttemptActivity(caseId,Number(attemptIndex),Number(itemIdx));
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };

  // 📌 Case Resolution & Invoicing
  static finalizeCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {case_} = await CasesService.finalizeCase(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static closeCase:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const {case_} = await CasesService.closeCase(caseId);
      res.locals.success = true;
      res.locals.data = case_.json();
      next();
    } catch (e) { next(e); }
  };
  static getInvoice:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const invoice = await CasesService.getInvoice(caseId);
      res.locals.success = true;
      res.locals.data = invoice;
      next();
    } catch (e) { next(e); }
  };
  static sendInvoice:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const invoice = await CasesService.sendInvoice(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = invoice;
      next();
    } catch (e) { next(e); }
  };
  static markInvoiceAsPaid:IHandler = async (req,res,next) => {
    try {
      const {caseId} = req.params;
      const invoice = await CasesService.markInvoiceAsPaid(caseId,req.body.data);
      res.locals.success = true;
      res.locals.data = invoice;
      next();
    } catch (e) { next(e); }
  };
}