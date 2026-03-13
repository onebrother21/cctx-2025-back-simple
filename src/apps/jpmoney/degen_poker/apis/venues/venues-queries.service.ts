import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {LocationHelpers} = Services;

export class DegenVenuesQueriesService {
  static queryDegenVenues = async (
    {locQuery,...query}:DegenTypes.IDegenVenueQuery,
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
      query["addr.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [];
    const projections = {
      creator:{
        id:"$creator._id",
        name:"$creator.name",
        displayName:"$creator.displayName",
        app:"$creator.app",
        type:"$creator.type",
        img:"$creator.img.url",
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
    
    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach(k => k !== "id"?o[k] = { $first: "$"+k }:null);
      //Utils.log(o);
      return o;
    };
    const selectProjections = (fields:string[]) => {
      const o:any = {_id:0};
      fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
      //Utils.info(o);
      return o;
    };
    pipeline.push(
      { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
      { $unwind: "$creator"},
      //{ $lookup: {from: "upcentric_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
      //{ $unwind: {path: '$admin',preserveNullAndEmptyArrays: true}},
      { $addFields: {
        creatorId:{$toString:"$creator._id"},
        created_on: { "$toDouble": "$createdOn" },
      }},
      { $match: query },
      { $group: selectGrouping(select)},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },
      { $project:  selectProjections(select)},
    );
    const results_ = await DegenModels.DegenVenue.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    return { results };
  };
  static queryDegenTags = async (query:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1;
    const limit = opts?.limit || 10;
    const skip = (page - 1) * limit;

    const pipeline:any[] = [];
    pipeline.push(
      { $unwind: "$meta.tags" },
      { $addFields: {created_on: { "$toDouble": "$createdOn" }}},
      { $match: query },
      { $group: { 
        _id: {
          text:"$meta.tags.text",
          creator:"$meta.tags.creator",
          createdOn:"$meta.tags.createdOn",
        },
        count: { $sum: 1 }
      }},
      { $skip: skip },
      { $limit: limit },
      { $sort: { "_id.text": 1} },
      { $project: { _id: 0, uniqueTag: "$_id", count:1 } }
    );
    
    //Utils.trace({query});
    const results_ = await DegenModels.DegenVenue.aggregate(pipeline);
    const results = results_.map(o => ({...o.uniqueTag,count:o.count}));
    return { results };
  };
}
export default DegenVenuesQueriesService;