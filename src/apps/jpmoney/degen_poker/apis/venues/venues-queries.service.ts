import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {MongooseAggHelpers} = Utils;

export class DegenVenuesQueriesService {
  static queryVenues = async (q:DegenTypes.IDegenVenueQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<DegenTypes.IDegenVenueQuery>({
      model:DegenModels.DegenVenue,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
        { $unwind: "$creator"},
        //{ $lookup: {from: "upcentric_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
        //{ $unwind: {path: '$admin',preserveNullAndEmptyArrays: true}},
        { $addFields: {
          creatorId:{$toString:"$creator._id"},
          created_on: { "$toDouble": "$createdOn" },
        }},
      ],
      projections:VENUE_PROJECTIONS,
      geoNearFields:["addr.loc"],
    }).runQuery();
    return {results};
  };
  static queryTags = async (query:any,select:string[],opts?:any,timestamp?:number) => {
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

const VENUE_PROJECTIONS = {
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