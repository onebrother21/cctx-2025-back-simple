import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";

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
  static queryCases = async (
    {locQuery,...query}:PiMiaTypes.ICaseQuery,
    select:string[],
    opts?:any,
    timestamp?:number
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["subject.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["client.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["vendor.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["admin.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [
      { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      { $lookup: {from: "cctx_profiles",localField: "client",foreignField: "_id",as: "client"}},
      { $unwind: "$client"},
      { $lookup: {from: "cctx_profiles",localField: "vendor",foreignField: "_id",as: "vendor"}},
      { $unwind: {path:"$vendor",preserveNullAndEmptyArrays: true}},
      { $lookup: {from: "cctx_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
      { $unwind: {path:"$admin",preserveNullAndEmptyArrays: true}},
      { $lookup: {from: "cctx_profiles",localField: "subjects",foreignField: "_id",as: "subjects"}},
      { $unwind: "$subjects"},
      { $unwind: "$subjects.emails"},
      { $unwind: "$subjects.phns"},
      { $unwind:{path:"$subjects.addrs",preserveNullAndEmptyArrays: true}},
      { $addFields: {
        subject:"$subjects",
        created_on: { "$toDouble": "$createdOn" },
        assigned_on: { "$toDouble": "$assignedOn" },
        start_on: { "$toDouble": "$startOn" },
        due_on: { "$toDouble": "$dueOn" },
        creatorId:{$toString:"$creator._id"},
        clientId:{$toString:"$client._id"},
        vendorId:{$toString:"$vendor._id"},
        adminId:{$toString:"$admin._id"},
        subjectId:{$toString:"$subjects._id"},
      }},
      { $match: query },
      { $group: Utils.selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },
      { $project:  Utils.selectProjections(select,CASE_PROJECTIONS)},
    ];
    const results_ = await PiMiaModels.Case.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    return { results };
  };
  static queryInvoices = async (
    {locQuery,...query}:PiMiaTypes.IInvoiceQuery,
    select:string[],
    opts?:any,
    timestamp?:number
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["subject.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["client.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["vendor.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
      query["admin.contact.addrs.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [
      { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      { $lookup: {from: "cctx_profiles",localField: "client",foreignField: "_id",as: "client"}},
      { $unwind: "$client"},
      { $lookup: {from: "cctx_profiles",localField: "vendor",foreignField: "_id",as: "vendor"}},
      { $unwind: {path:"$vendor",preserveNullAndEmptyArrays: true}},
      { $lookup: {from: "cctx_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
      { $unwind: {path:"$admin",preserveNullAndEmptyArrays: true}},
      { $lookup: {from: "cctx_profiles",localField: "subjects",foreignField: "_id",as: "subjects"}},
      { $unwind: "$subjects"},
      { $unwind: "$subjects.emails"},
      { $unwind: "$subjects.phns"},
      { $unwind:{path:"$subjects.addrs",preserveNullAndEmptyArrays: true}},
      { $addFields: {
        subject:"$subjects",
        created_on: { "$toDouble": "$createdOn" },
        assigned_on: { "$toDouble": "$assignedOn" },
        start_on: { "$toDouble": "$startOn" },
        due_on: { "$toDouble": "$dueOn" },
        creatorId:{$toString:"$creator._id"},
        clientId:{$toString:"$client._id"},
        vendorId:{$toString:"$vendor._id"},
        adminId:{$toString:"$admin._id"},
        subjectId:{$toString:"$subjects._id"},
      }},
      { $match: query },
      { $group: Utils.selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },
      { $project:  Utils.selectProjections(select,INVOICE_PROJECTIONS)},
    ];
    const results_ = await PiMiaModels.Invoice.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    return { results };
  };
}
export default AdminService;

const CASE_PROJECTIONS = {
  creator:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  client:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  vendor:{
    id:"$vendor._id",
    name:"$vendor.name",
    displayName:"$vendor.displayName",
    app:"$vendor.app",
    type:"$vendor.type",
    img:"$vendor.img.url",
  },
  admin:{
    id:"$admin._id",
    name:"$admin.name",
    displayName:"$admin.displayName",
    app:"$admin.app",
    type:"$admin.type",
    img:"$admin.img.url",
  },
  subjects:{
    id:"$subjects._id",
    name:"$subjects.name",
    displayName:"$subjects.displayName",
    app:"$subjects.app",
    type:"$subjects.type",
    img:"$subjects.img.url",
  },
  addr:{
    info:"$addr.info",
    loc:"$addr.loc.coordinates",
  },
  /*
  admin:{
    id:"$admin._id",
    name:"$admin.name",
    displayName:"$admin.displayName",
    org:"$admin.org",
    img:"$admin.img.url",
  },
  pets: { 
    $filter:{ 
      input: "$log",
      as: "log",
      cond: { $not: { $in: ["$$log.status", [null, "",undefined]] } }
    }
  }
  */
};
const INVOICE_PROJECTIONS = {
  creator:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  client:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  vendor:{
    id:"$vendor._id",
    name:"$vendor.name",
    displayName:"$vendor.displayName",
    app:"$vendor.app",
    type:"$vendor.type",
    img:"$vendor.img.url",
  },
  admin:{
    id:"$admin._id",
    name:"$admin.name",
    displayName:"$admin.displayName",
    app:"$admin.app",
    type:"$admin.type",
    img:"$admin.img.url",
  },
  subjects:{
    id:"$subjects._id",
    name:"$subjects.name",
    displayName:"$subjects.displayName",
    app:"$subjects.app",
    type:"$subjects.type",
    img:"$subjects.img.url",
  },
  addr:{
    info:"$addr.info",
    loc:"$addr.loc.coordinates",
  },
  /*
  admin:{
    id:"$admin._id",
    name:"$admin.name",
    displayName:"$admin.displayName",
    org:"$admin.org",
    img:"$admin.img.url",
  },
  pets: { 
    $filter:{ 
      input: "$log",
      as: "log",
      cond: { $not: { $in: ["$$log.status", [null, "",undefined]] } }
    }
  }
  */
};