import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const {MongooseAggHelpers} = Services;

export class TasksQueriesService {
  static queryTasks = async (q:Types.ITaskQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<Types.ITaskQuery>({
      model:Models.Task,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
        { $unwind: "$creator"},
        { $lookup: {from: "cctx_profiles",localField: "admin",foreignField: "_id",as: "admin"}},
        { $unwind: {path:'$admin',preserveNullAndEmptyArrays: true}},
        { $unwind: {path:'$notes',preserveNullAndEmptyArrays: true}},
        { $lookup: {from: "cctx_profiles",localField: "notes.author",foreignField: "_id",as: "notes.author"}},
        { $unwind: {path:'$notes.author',preserveNullAndEmptyArrays: true}},
        { $lookup: {from: "cctx_tasks",localField: "tasks",foreignField: "_id",as: "tasks"}},
        { $unwind: {path:'$tasks',preserveNullAndEmptyArrays: true}},
        { $lookup: {from: "cctx_profiles",localField: "tasks.creator",foreignField: "_id",as: "tasks.creator"}},
        { $unwind: {path:'$tasks.creator',preserveNullAndEmptyArrays: true}},
        { $addFields: {
          adminId:{$toString:"$admin._id"},
          creatorId:{$toString:"$creator._id"},
          created_on: { "$toDouble": "$createdOn" },
          start_on: { "$toDouble": "$startOn" },
          due_on: { "$toDouble": "$dueOn" },
          assigned: { "$toDouble": "$meta.assigned" },
          completed: { "$toDouble": "$meta.completed" },
        }}
      ],
      geoNearFields:["location"],
      projections:TASK_PROJECTIONS,
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
    const results = await Models.Task.aggregate(pipeline);
    return { results };
  };
}
export default TasksQueriesService;

const TASK_PROJECTIONS:any = {
  creator: {
    id: {$toString:"$creator._id"},
    name: "$creator.name",
    displayName: "$creator.displayName",
    app: "$creator.app",
    type: "$creator.type",
    img: "$creator.img.url",
  },
  admin: {
    $cond: {
      if: { $eq: [{ $ifNull: ["$admin", ""] }, ""] },
      then: null,
      else: {
        id: {$toString:"$admin._id"},
        name: "$admin.name",
        displayName: "$admin.displayName",
        app: "$admin.app",
        type: "$admin.type",
        img: "$admin.img.url",
      },
    },
  },
  notes: {
    $cond: {
      if: { $eq: [{ $size: { $ifNull: ["$notes", []] } }, 0] },
      then: [],
      else: "$notes",
    },
  },
  tasks: {
    $cond: {
      if: { $eq: [{ $size: { $ifNull: ["$tasks", []] } }, 0] },
      then: [],
      else: "$tasks",
    },
  },
};