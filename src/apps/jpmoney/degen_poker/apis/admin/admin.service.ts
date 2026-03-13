import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {LocationHelpers} = Services;

const notify = Services.Notifications.createNotification;

const queryOpts = { new:true,runValidators: true,context:'query' };
const saltRounds = Number(process.env.SALT_ROUNDS || 10);

const approvalStats = Types.IApprovalStatuses;
const profileStats = Types.IProfileStatuses;
const {EMAIL,SMS,PUSH} = Types.IContactMethods;

const {Profile,AppUsage} = Models;
const {Notifications:NotificationSvc} = Services;
const {AppError} = Utils;

export class AdminService {
  static registerAdmin = async (req:IRequest) => {
    type AdminInit = Partial<Types.IProfile> & LocationObj;
    const {loc,...data} = req.body.data as AdminInit;
    const user = req.user as Types.IUser;
    if(!/degen_poker/.test(data.app)) throw new AppError(400,"wrong app!");
    const role = data.app+"-"+data.type;

    const admin = new Profile({
      creator:req.user.id,
      app:data.app,
      type:data.type,
      name:user.fullname,
      displayName:user.username,
      img:data.img,
      org:data.org,
      meta:{user:user.id,scopes:[]},
      loc:{type:"Point",coordinates:loc},
      status:profileStats.NEW,
      info:{...data.info}
    });
    try{await admin.saveMe();}catch(e){Utils.error(e);throw e;}
    user.profiles.push({name:role,obj:admin});
    await user.saveMe();
    await notify({
      type:"PLAYER_REGISTERED",
      method:EMAIL,
      audience:[{user:user.id,info:user.email}],
      data:{adminName:admin.name}
    });
    user.role = role;
    await AppUsage.make(`usr/${user.id}`,"createdAdminProfile",{which:`prf/${admin.id}`});
    return true;
  };
  static getAdminById = async (adminId:string) => {
    const admin = await Models.Profile.findById(adminId);
    if(!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.populateMe();
    return {admin};
  };
  static updateAdmin = async (adminId:string,{notes,...updates}:any) => {
    const admin = await Models.Profile.findByIdAndUpdate(adminId,{
      ...notes?{$push:notes}:{},
      ...updates?{$set:updates}:{},
    },queryOpts);
    if (!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.populateMe();
    return {admin};
  };
  static deleteAdmin = async (adminId:string) => {
    const admin = await Models.Profile.findByIdAndDelete(adminId);
    if (!admin) throw new Utils.AppError(422,'Requested admin not found');
    return {ok:true};
  };
  static updateAdminStatus = async (
    adminId:string,
    {progress,priority,...o}:{progress?:number,priority?:number}) => {
    const admin = await Models.Profile.findById(adminId);
    if(!admin) throw new Utils.AppError(422,'Requested admin not found');
    await admin.saveMe();
    return {admin};
  };
  static queryProfiles = async (
    {locQuery,...query}:Types.IProfileQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'when';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery  || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["location"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [
      { $addFields: {
        when_date: { "$toDouble": "$when" },
      }},
      { $match: query },
      { $group: Utils.selectGrouping(select)},
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  Utils.selectProjections(select,{})},
    ];
    const results_ = await Models.Profile.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    Utils.log(Utils.flattenObject(results[0]));
    return { results };
  };
  static querySessions = async (
    {locQuery,...query}:DegenTypes.IDegenSessionQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'when';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery  || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["venue.addr.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [
      { $addFields: {
        when_date: { "$toDouble": "$when" },
      }},
      { $match: query },
      { $group: Utils.selectGrouping(select)},
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  Utils.selectProjections(select)},
    ];
    const results_ = await DegenModels.DegenSession.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    Utils.log(Utils.flattenObject(results[0]));
    return { results };
  };
  static queryVenues = async (
    {locQuery,...query}:DegenTypes.IDegenVenueQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'when';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery  || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["addr.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
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
    const results_ = await DegenModels.DegenVenue.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    Utils.log(Utils.flattenObject(results[0]));
    return { results };
  };
}
export default AdminService;