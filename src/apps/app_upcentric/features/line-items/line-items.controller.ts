import { FinancialLineItemsService } from './line-items.service';
import Types from "../../../../types";
import Utils from '../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class FinancialLineItemsController {
  // 📌 FinancialLineItem CRUD Ops
  static createFinancialLineItem:IHandler = async (req,res,next) => {
    try {
      Utils.print("trace","new-item",req.body.data);
      const {item} = await FinancialLineItemsService.createFinancialLineItem(req.user.id,req.body.data);
      res.locals.success = true;
      res.locals.data = item.json();
      next();
    } catch (e) { next(e); }
  };
  static getFinancialLineItemById:IHandler = async (req,res,next) => {
    try {
      const {itemId} = req.params;
      const {item} = await FinancialLineItemsService.getFinancialLineItemById(itemId);
      res.locals.success = true;
      res.locals.data = item.json();
      next();
    } catch (e) { next(e); }
  };
  static updateFinancialLineItem:IHandler = async (req,res,next) => {
    try {
      const {item} = await FinancialLineItemsService.updateFinancialLineItem(req.params.itemId,req.body.data);
      res.locals.success = true;
      res.locals.data = item.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteFinancialLineItem:IHandler = async (req,res,next) => {
    try {
      const {ok} = await FinancialLineItemsService.deleteFinancialLineItem(req.params.itemId);
      res.locals.success = ok;
      res.locals.data = {removed:req.params.itemId,ok};
      next();
    } catch (e) { next(e); }
  };
  // 📌 Case Queries
  
  static queryFinancialLineItems:IHandler = async (req,res,next) => {
    try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await FinancialLineItemsService.queryFinancialLineItems(q,s,o,t);
      res.locals.success = true;
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}