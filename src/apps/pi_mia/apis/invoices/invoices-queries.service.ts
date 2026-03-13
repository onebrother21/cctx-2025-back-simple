import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";

const {LocationHelpers} = Services;

export class InvoicesQueriesService {
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
export default InvoicesQueriesService;

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