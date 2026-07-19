import UserOpsService from './ops.service';
import UserOpsQueries from './ops-queries.service';

import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

export class UserOpsController {
  static registerUser:IHandler = async (req,res,next) => {
    try {
      const ok = await UserOpsService.registerUser(req);
      res.locals = {
        ...res.locals,
        status:201,
        success:true,
        message:"You have registered a new user profile!",
        data:{ok},
      };
      next();
    } catch (e) { next(e); }
  };
  static getUserById:IHandler = async (req,res,next) => {
    try {
      const profileId = req.params.profileId as string;
      const {profile} = await UserOpsService.getUserById(profileId);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  static updateUser:IHandler = async (req,res,next) => {
    try {
      const data = req.body.data;
      const profileId = req.params.profileId as string;
      const {profile} = await UserOpsService.updateUser(profileId,data);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  static updateUserStatus:IHandler = async (req,res,next) => {
    try {
      const profileId = req.params.profileId as string;
      const data = req.body.data;
      const {profile} = await UserOpsService.updateUserStatus(profileId,data);
      res.locals.success = true;
      res.locals.data = profile.json();
      next();
    } catch (e) { next(e); }
  };
  static deleteUser:IHandler = async (req,res,next) => {
    try {
      const profileId = req.params.profileId as string;
      const {ok} = await UserOpsService.deleteUser(profileId);
      res.locals.success = ok;
      res.locals.data = {removed:profileId,ok};
      next();
    } catch (e) { next(e); }
  };
  static queryExtChains:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await UserOpsQueries.queryExtChains(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryExtWallets:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await UserOpsQueries.queryExtWallets(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryCards:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await UserOpsQueries.queryCards(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryPos:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await UserOpsQueries.queryPos(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
  static queryTransactions:IHandler = async (req,res,next) => {
    try{
      const profileId = req.profile.id;
      const {q,s,o,t} = JSON.parse(req.query.qstr as string);
      const data = await UserOpsQueries.queryTransactions(q,s,o,t);
      res.locals.success = true,
      res.locals.data = data;
      next();
    } catch(e) { next(e); }
  };
}
export default UserOpsController;