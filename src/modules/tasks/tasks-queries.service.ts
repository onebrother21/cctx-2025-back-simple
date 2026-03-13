import Models from "@models";
import Types from "@types";
import Utils from "@utils";

export class CCTXTasksQueriesService {
  // 📌 CCTXTask Queries
  static queryCCTXTasks = async (
    //location,
    {...query_}:Types.ITaskQuery,
    select:string[],
    opts?:any,
    timestamp?:number
  ) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;
    /*
    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {"addr.loc":{$geoWithin:{$centerSphere:[pts,searchRadius]}}};
    const query = {...query_,...(location?locationQ:{})};
    */
    const query = {...query_};
    const pipeline:any[] = [];

    const projections: any = {
      creator: {
        id: "$creator._id",
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
            id: "$admin._id",
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
        if (k === "tasks") {
          o[k] = {
            $push: {
              $cond: [
                { $ne:[{ $ifNull: ["$tasks.creator", ""] }, ""] },
                {
                  creator: {
                    id: "$tasks.creator._id",
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
      ...(select.includes("tasks")
        ? [{
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
          }]
        : []
      ),
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $skip: skip },
      { $limit: limit },
      { $project:  selectProjections(select)},
    );
    let results = await Models.Task.aggregate(pipeline);
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
    const results = await Models.Task.aggregate(pipeline);
    return { results };
  };
}