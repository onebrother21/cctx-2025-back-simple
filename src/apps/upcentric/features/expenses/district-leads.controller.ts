import { DistrictLeadsService } from './district-leads.service';
import Types from "../../../../types";
import Utils from '../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class DistrictLeadsController {
  // 📌 DistrictLead CRUD Ops
  static createDistrictLead:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-lead",req.body.data);
      const {lead} = await DistrictLeadsService.createDistrictLead(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = lead.json();
      next();
    } catch (e) { next(e); }
  };
  static getDistrictLeadById:IHandler = async (req,res,next) => {
    try {
      const {leadId} = req.params;
      const {lead} = await DistrictLeadsService.getDistrictLeadById(leadId);
      res.locals.success = true;
      res.locals.data = lead.json();
      next();
    } catch (e) { next(e); }
  };
  static updateDistrictLead:IHandler = async (req,res,next) => {
    try {
      const {lead} = await DistrictLeadsService.updateDistrictLead(req.params.leadId,req.body.data);
      res.locals.success = true;
      res.locals.data = lead.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteDistrictLead:IHandler = async (req,res,next) => {
    try {
      const {ok} = await DistrictLeadsService.deleteDistrictLead(req.params.leadId);
      res.locals.success = ok;
      res.locals.data = {removed:req.params.leadId,ok};
      next();
    } catch (e) { next(e); }
  };
  // 📌 Case Queries
  
  static queryDistrictLeads:IHandler = async (req,res,next) => {
    try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DistrictLeadsService.queryDistrictLeads(q,s,o,t);
      res.locals = {success:true,data};
      next();
    } catch(e) { next(e); }
  };
}