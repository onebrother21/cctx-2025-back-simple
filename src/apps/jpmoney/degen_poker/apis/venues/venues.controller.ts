import DegenVenuesService from './venues.service';
import DegenVenuesQueries from './venues-queries.service';

import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class DegenVenuesController {
  static createVenues:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const {items} = req.body.data;
      const {venues} = await DegenVenuesService.createVenues(profileId,items);
      res.locals.success = true;
      res.locals.data = {created:venues.length,ok:true};
      next();
    } catch (e) { next(e); }
  };
  static createVenue:IHandler = async (req,res,next) => {
    try {
      const profileId = req.profile.id;
      const data = req.body.data;
      const {venue} = await DegenVenuesService.createVenue(profileId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static getVenueById:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.getVenueById(venueId);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static updateVenue:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {venueId} = req.params;
      const {venue} = await DegenVenuesService.updateVenue(venueId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteVenue:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const {ok} = await DegenVenuesService.deleteVenue(venueId);
      res.locals.success = ok;
      res.locals.data = {removed:venueId,ok};
      next();
    } catch (e) { next(e); }
  };
  static updateVenueStatus:IHandler = async (req,res,next) => {
    try {
      const {venueId} = req.params;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {venue} = await DegenVenuesService.updateVenueStatus(admin,venueId,data);
      res.locals.success = true;
      res.locals.data = venue.json();
      next();
    } catch (e) { next(e); }
  };
  static queryDegenVenues:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenVenuesQueries.queryVenues(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryDegenTags:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenVenuesQueries.queryTags(q,s,o,t);
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