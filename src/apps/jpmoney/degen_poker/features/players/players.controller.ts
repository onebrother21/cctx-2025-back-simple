import { DegenPlayersService } from './players.service';
import { DegenPlayersQueriesService } from './players-queries.service';

import Types from "../../../../../types";
import Utils from '../../../../../utils';
import fs from "fs";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export class DegenPlayersController { 
  // 📌 DegenPlayer Profile CRUD Ops
  static registerPlayer:IHandler = async (req,res,next) => {
    try {
      const ok = await DegenPlayersService.registerPlayer(req);
      res.locals ={
        status:201,
        success:true,
        enc:true,
        message:"You have registered a new player profile!",
        data:{ok},
      };
      next();
    } catch (e) { next(e); }
  };
  static getDegenPlayerById:IHandler = async (req,res,next) => {
    try {
      const {playerId} = req.params;
      const {player} = await DegenPlayersService.getDegenPlayerById(playerId);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
  static updateDegenPlayer:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const {playerId} = req.params;
      const {player} = await DegenPlayersService.updateDegenPlayer(playerId,data);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteDegenPlayer:IHandler = async (req,res,next) => {
    try {
      const {playerId} = req.params;
      const {ok} = await DegenPlayersService.deleteDegenPlayer(playerId);
      res.locals.success = ok;
      res.locals.data = {removed:playerId,ok};
      next();
    } catch (e) { next(e); }
  };
  static createDegenPlayers:IHandler = async (req,res,next) => {
    try {
      const {players} = await DegenPlayersService.createDegenPlayers(req);
      res.locals.success = true;
      res.locals.data = {created:players.length,ok:true};
      next();
    } catch (e) { next(e); }
  };

  
  // 📌 DegenPlayer Queries
  static queryDegenPlayers:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenPlayersQueriesService.queryDegenPlayers(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryProfiles:IHandler = async (req,res,next) => {
     try{
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await DegenPlayersQueriesService.queryProfiles(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static updateDegenPlayerStatus:IHandler = async (req,res,next) => {
    try {
      const {playerId} = req.params;
      const admin = req.profile.displayName;
      const data = req.body.data;
      const {player} = await DegenPlayersService.updateDegenPlayerStatus(admin,playerId,data);
      res.locals.success = true;
      res.locals.data = player.json();
      next();
    } catch (e) { next(e); }
  };
}