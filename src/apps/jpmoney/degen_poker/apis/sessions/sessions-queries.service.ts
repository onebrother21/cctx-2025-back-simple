import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {LocationHelpers} = Services;

export class DegenSessionsQueriesService {
  static queryDegenSessions = async (
    {locQuery,...query}:DegenTypes.IDegenSessionQuery,
    select:string[],
    opts?:any,
    timestamp?:number,
  ) => {
    const page = opts?.currentPage || 1;
    const limit = opts?.limit || 10;
    const skip = (page - 1) * limit;
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      query["venue.addr.loc"] = {$geoWithin:{$centerSphere:[pts,searchRadius]}};
    }
    const pipeline:any[] = [];
    const projections:any = {
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

    const selectGrouping = (fields:string[]) => {
      const o:any = {_id: "$_id"};
      fields.forEach((k) => {
        if (k === "id") return;
        if (k === "notes") {
          o[k] = {
            $push: {
              $cond: [
                { $ne:[{ $ifNull: ["$notes.author", ""] }, ""] },
                {
                  author: {
                    id: "$notes.author._id",
                    name: "$notes.author.name",
                    displayName: "$notes.author.displayName",
                    app: "$notes.author.app",
                    type: "$notes.author.type",
                    img: "$notes.author.img.url",
                  },
                  body: "$notes.body",
                  time: "$notes.time",
                },
                null,
              ],
            },
          };
          return;
        }
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
      { $match: query },
      { $group: selectGrouping(select)},
      ...(select.includes("notes")
        ? [{
            $addFields: {
              notes: {
                $cond: [
                  { $isArray: "$notes" },
                  {
                    $filter: {
                      input: "$notes",
                      as: "n",
                      cond: { $ne: ["$$n", null] },
                    },
                  },
                  [],
                ],
              },
            },
          }]
        : []
      ),
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
      { $project:  selectProjections(select)},
    );
    const results_ = await DegenModels.DegenSession.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    return { results };
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