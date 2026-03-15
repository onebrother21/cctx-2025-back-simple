import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {MongooseAggHelpers} = Services;

export class DegenSessionsQueriesService {
  static querySessions = async (q:DegenTypes.IDegenSessionQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<DegenTypes.IDegenSessionQuery>({
      model:DegenModels.DegenSession,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
        { $unwind: "$creator"},
        { $lookup: {from: "degen_poker_venues",localField: "venue",foreignField: "_id",as: "venue"}},
        { $unwind: '$venue'},
        { $unwind: {path:'$notes',preserveNullAndEmptyArrays: true}},
        { $lookup: {from: "cctx_profiles",localField: "notes.author",foreignField: "_id",as: "notes.author"}},
        { $unwind: {path:'$notes.author',preserveNullAndEmptyArrays: true}},
        { $addFields: {
          player: "$creator",
          playerId:{$toString:"$creator._id"},
          creatorId:{$toString:"$creator._id"},
          created_on: { "$toDouble": "$createdOn" },
          play_date: { "$toDouble": "$dateOfPlay" },
        }},
      ],
      projections:SESSION_PROJECTIONS,
      geoNearFields:["venue.addr.loc"],
    }).runQuery();
    return {results};
  };
  static queryDescriptions = async (query:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip

    const pipeline:any[] = [];
    pipeline.push(
      { $match: query },
      { $group: { _id: "$desc" } },
      { $skip: skip },
      { $limit: limit },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, uniqueDesc: "$_id" } }
    );
    
    //Utils.trace({query});
    const results = await DegenModels.DegenSession.aggregate(pipeline);
    return { results };
  };
}
export default DegenSessionsQueriesService;

const SESSION_PROJECTIONS:any = {
  creator:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  player:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    app:"$creator.app",
    type:"$creator.type",
    img:"$creator.img.url",
  },
  venue:{
    id:"$venue._id",
    name:"$venue.name",
    addr:"$venue.addr.info",
  },
  notes: {
    $cond: {
      if: { $eq: [{ $size: { $ifNull: ["$notes", []] } }, 0] },
      then: [],
      else: "$notes",
    },
  },
};