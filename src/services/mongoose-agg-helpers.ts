import mongoose from "mongoose";
import {LocationHelpers} from "./location-helpers.service";

export type inferedQ<T> = T extends StrongQuery<infer Q>?T:never;
export type MongooseAggParams<Q> = {
  model:mongoose.Model<Document_>;
  query:inferedQ<Q>;
  select:string[];
  opts:any;
  timestamp:number;
  geoNearFields:string[];
  projections:any;
  prePipeline:any[];
};
export interface MongooseAggHelpers<Q> extends MongooseAggParams<Q>{
  runQuery():Promise<{results:any[]}>;
}
export class MongooseAggHelpers<Q> {
  constructor(o:MongooseAggParams<Q>){Object.assign(this,o);}
  selectGrouping = (fields:string[]) => {
    const o:any = { _id: {$toString:"$_id"}};
    fields.forEach((k) => {
      switch(k){
        case"id":return;
        case "msgs":{
          o[k] = {
            $push: {
              $cond: [
                { $ne:[{ $ifNull: ["$msgs.author", ""] }, ""] },
                {
                  author: {
                    id: {$toString:"$msgs.author._id"},
                    name: "$msgs.author.name",
                    displayName: "$msgs.author.displayName",
                    app: "$msgs.author.app",
                    type: "$msgs.author.type",
                    img: "$msgs.author.img.url",
                  },
                  body: "$msgs.body",
                  time: "$msgs.time",
                },
                null,
              ],
            },
          };
          break;
        }
        case "notes":{
          o[k] = {
            $push: {
              $cond: [
                { $ne:[{ $ifNull: ["$notes.author", ""] }, ""] },
                {
                  author: {
                    id: {$toString:"$notes.author._id"},
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
          break;
        }
        case "tasks":{
          o[k] = {
            $push: {
              $cond: [
                { $ne:[{ $ifNull: ["$tasks.creator", ""] }, ""] },
                {
                  creator: {
                    id: {$toString:"$tasks.creator._id"},
                    name: "$tasks.creator.name",
                    displayName: "$tasks.creator.displayName",
                    app: "$tasks.creator.app",
                    type: "$tasks.creator.type",
                    img: "$tasks.creator.img.url",
                  },
                  app:"$tasks.app",
                  project: "$tasks.project",
                  type: "$tasks.type",
                  title: "$tasks.title",
                  desc: "$tasks.desc",
                  createdOn: "$tasks.createdOn",
                  dueOn: "$tasks.dueOn",
                },
                null,
              ],
            },
          };
          break;
        }
        default:o[k] = { $first: "$" + k };break;
      }
    });
    return o;
  };
  addFieldsForNotes = () => [{
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
  }];
  addFieldsForTasks = () => [{
    $addFields: {
      tasks: {
        $cond: [
          { $isArray: "$tasks" },
          {
            $filter: {
              input: "$tasks",
              as: "n",
              cond: { $ne: ["$$n", null] },
            },
          },
          [],
        ],
      },
    },
  }];
  selectProjections = (fields:string[],projections:any) => {
    const o:any = {_id:0};
    fields.forEach(k => o[k] = k == "id"?"$_id":projections[k] || 1);
    return o;
  };
  runQuery = async () =>{
    const {query:{locQuery,...query_},select,opts,geoNearFields,projections,prePipeline,model} = this;
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;
    let query:any = {};
    if(locQuery){
      const {pts,radius = 5,unit = "mi"} = locQuery  || {};
      const searchRadius = radius/(unit == "mi"?3963.2:6371);
      geoNearFields.forEach(k => query[k] = {$geoWithin:{$centerSphere:[pts,searchRadius]}});
    }
    query = {...query,...query_};
    const pipeline:any[] = [
      ...prePipeline,
      { $match: query },
      { $group: this.selectGrouping(select)},
      ...(select.includes("notes")?this.addFieldsForNotes():[]),
      ...(select.includes("tasks")?this.addFieldsForTasks():[]),
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  this.selectProjections(select,projections)},
    ];
    const results_ = await model.aggregate(pipeline);
    const results = locQuery?
    LocationHelpers.formatQueryResultsWithDistCalc(results_,select,locQuery):
    results_;
    return { results };
  };
}
export default MongooseAggHelpers;