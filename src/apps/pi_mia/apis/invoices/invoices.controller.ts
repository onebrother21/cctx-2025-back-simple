import { InvoicesService } from './invoices.service';
import { InvoicesQueriesService } from './invoices-queries.service';

import Types from "@types";
import Utils from '@utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class InvoicesController {
  static createInvoice:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {pimiaInvoice} = await InvoicesService.createInvoice(profileId,data);
      res.locals.success = true;
      res.locals.data = pimiaInvoice.json();
      next();
    }
    catch (e) { next(e); }
  };
  static getInvoiceById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {invoiceId} = req.params;
      const {pimiaInvoice} = await InvoicesService.getInvoiceById(profileId,invoiceId);
      res.locals.success = true;
      res.locals.data = pimiaInvoice.json();
      next();
    } catch (e) { next(e); }
  };
  static updateInvoice:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {invoiceId} = req.params;
      const {pimiaInvoice} = await InvoicesService.updateInvoice(profileId,invoiceId,data);
      res.locals.success = true;
      res.locals.data = pimiaInvoice.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteInvoice:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {invoiceId} = req.params;
      const {ok} = await InvoicesService.deleteInvoice(profileId,invoiceId);
      res.locals.success = ok;
      res.locals.data = {removed:invoiceId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateInvoiceStatus:IHandler = async (req,res,next) => {
    try {
      const {invoiceId} = req.params;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {pimiaInvoice} = await InvoicesService.updateInvoiceStatus(invoiceId,data);
      res.locals.success = true;
      res.locals.data = pimiaInvoice.json();
      next();
    } catch (e) { next(e); }
  };
  static sendInvoice:IHandler = async (req,res,next) => {
    try {
      const {invoiceId} = req.params;
      const invoice = await InvoicesService.sendInvoice(invoiceId,req.body.data);
      res.locals.success = true;
      res.locals.data = invoice;
      next();
    } catch (e) { next(e); }
  };
  static markInvoiceAsPaid:IHandler = async (req,res,next) => {
    try {
      const {invoiceId} = req.params;
      const invoice = await InvoicesService.markInvoiceAsPaid(invoiceId,req.body.data);
      res.locals.success = true;
      res.locals.data = invoice;
      next();
    } catch (e) { next(e); }
  };
  static queryInvoices:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await InvoicesQueriesService.queryInvoices(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}