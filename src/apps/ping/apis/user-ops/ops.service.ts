import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import { QueryOptions } from 'mongoose';

import PingModels from "../../models";
import PingTypes from "../../types";

const {LocationHelpers} = Services;

const notify = Services.Notifications.createNotification;

const queryOpts:QueryOptions = { returnDocument:"after",runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class UserOpsService {
  static registerUser = async (req:IRequest) => {
    type UserInit = Partial<Types.IProfile> & LocationObj;
    const {loc,...data} = req.body.data as UserInit;
    const user = req.user as Types.IUser;
    const app = data.app;
    if(!app) throw new Utils.AppError(400,"unrecognized appspace!");
    if(!/ping/.test(app)) throw new Utils.AppError(400,"wrong app!");
    const role = app+"-"+data.type;

    const profile = new Profile({
      creator:req.user.id,
      status:profileStats.NEW,
      app,
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      settings:{lang:"en"},
      info:{...data.info},
      meta:{user:user.id,memberSince:new Date()},
      loc:{type:"Point",coordinates:loc},
    });
    try{await profile.saveMe();}catch(e){Utils.error("ping-ops.service",e);throw e;}
    user.profiles.push({name:role,obj:profile});
    await user.saveMe();
    await notify({
      type:"PLAYER_REGISTERED",//chng to USER_REGISTERED
      method:EMAIL,
      audience:[{user:user.id as any,info:user.email}],
      data:{profileName:profile.name}
    });
    user.role = role;
    await AppUsage.make(`usr/${user.id}`,"createdUserProfile",{which:`prf/${profile.id}`});
    return true;
  };
  static getUserById = async (profileId:string) => {
    const profile = await Models.Profile.findById(profileId);
    if(!profile) throw new Utils.AppError(422,'Requested profile not found');
    await profile.populateMe();
    return {profile};
  };
  static updateUser = async (profileId:string,{notes,...updates}:any) => {
    const profile = await Models.Profile.findByIdAndUpdate(profileId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!profile) throw new Utils.AppError(422,'Requested profile not found');
    await profile.populateMe();
    return {profile};
  };
  static deleteUser = async (profileId:string) => {
    const profile = await Models.Profile.findByIdAndDelete(profileId);
    if (!profile) throw new Utils.AppError(422,'Requested profile not found');
    return {ok:true};
  };
  static updateUserStatus = async (
    profileId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const profile = await Models.Profile.findById(profileId);
    if(!profile) throw new Utils.AppError(422,'Requested profile not found');
    await profile.saveMe();
    return {profile};
  };
  static queryAppUsage = async (
    {locQuery,...query_}:Types.IAppUsageQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'when';
    const sortOrder = opts?.order || -1;
    const query = {...query_};

    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["where"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    
    const pipeline:any[] = [];

    const projections:any = {};

    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach((k) => {
        if (k === "id") return;
        o[k] = { $first: "$" + k };
      });
      return o;
    };
    const selectProjections = (fields: string[]) => {
      const o: any = { _id: 0 };
      fields.forEach((k) => (o[k] = k === "id" ? "$_id" : projections[k] || 1));
      return o;
    };
    pipeline.push(
      { $addFields: {
        when_date: { "$toDouble": "$when" },
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  selectProjections(select)},
    );
    const results_ = await Models.AppUsage.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    //Utils.log(pipeline,results);
    return { results };
  };
}
export default UserOpsService;