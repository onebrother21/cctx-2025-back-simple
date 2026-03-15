import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PiMiaModels from "../../models";
import PiMiaTypes from "../../types";

const {MongooseAggHelpers} = Services;

export class CasesQueriesService {
  static queryCases = async (q:PiMiaTypes.ICaseQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<PiMiaTypes.ICaseQuery>({
      model:PiMiaModels.Case,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      geoNearFields:[
        "subject.contact.addrs.loc",
        "client.contact.addrs.loc",
        "vendor.contact.addrs.loc",
        "admin.contact.addrs.loc"
      ],
      prePipeline:[
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
      ],
      projections:CASE_PROJECTIONS,
    }).runQuery();
    return {results};
  };
}
export default CasesQueriesService;

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