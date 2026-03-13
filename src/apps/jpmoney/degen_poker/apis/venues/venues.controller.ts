import { DegenVenuesService } from './venues.service';
import { DegenVenuesQueriesService } from './venues-queries.service';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class DegenVenuesController { 
  // 📌 DegenVenue CRUD Ops
  static createDegenVenues:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {venues} = await DegenVenuesService.createDegenVenues(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:venues.length,ok:true};
      next();
    } catch (e) { next(e); }
  };
  static createDegenVenue:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {venue} = await DegenVenuesService.createDegenVenue(profileId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static getDegenVenueById:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.getDegenVenueById(venueId);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static updateDegenVenue:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.updateDegenVenue(venueId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteDegenVenue:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {ok} = await DegenVenuesService.deleteDegenVenue(venueId);
      res.locals.success = ok;
      res.locals.data = {removed:venueId,ok};
      next();
    } catch (e) { next(e); }
  };
  
  // 📌 DegenVenue Queries
  static updateDegenVenueStatus:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {venue} = await DegenVenuesService.updateDegenVenueStatus(admin,venueId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  /*
  static addFilesToDegenVenue:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {files} = req.body.data;
      if(!venueId) throw new Utils.AppError(422,'Requested parameters not found');
      const {venue} = await DegenVenuesService.addFilesToDegenVenue(venueId,files);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  */
  
  static finalizeDegenVenue:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.finalizeDegenVenue(venueId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static closeDegenVenue:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.closeDegenVenue(venueId);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static queryDegenVenues:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenVenuesQueriesService.queryDegenVenues(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryDegenTags:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenVenuesQueriesService.queryDegenTags(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static lookupVenueAddress:IHandler = async (req,res,next) => {
    try {
      const {results} = await DegenVenuesService.lookupVenueAddress(req.query.qstr as string);
      res.locals.success = true;
      res.locals.data = {results};
      next();
    } catch (e) { next(e); }
  };
  static lookupVenueAddress2:IHandler = async (req,res,next) => {
    try {
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const {results} = await DegenVenuesService.lookupVenueAddress2(q);
      res.locals.success = true;
      res.locals.data = {results};
      next();
    } catch (e) { next(e); }
  };
}