import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const {MongooseAggHelpers} = Services;

export class MsgChainsQueriesService {
  static queryMsgChains = async (q:Types.IMsgChainQuery,s:string[],o?:any,t:number = 0) => {
    const {results} = await new MongooseAggHelpers<Types.IMsgChainQuery>({
      model:Models.MsgChain,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $lookup: {from: "cctx_profiles",localField: "creator",foreignField: "_id",as: "creator"}},
        { $unwind: "$creator"},
        { $lookup: {from: "cctx_profiles",localField: "users",foreignField: "_id",as: "users"}},
        { $unwind: {path:'$users',preserveNullAndEmptyArrays: true}},
        { $unwind: {path:'$msgs',preserveNullAndEmptyArrays: true}},
        { $lookup: {from: "cctx_profiles",localField: "msgs.creator",foreignField: "_id",as: "msgs.creator"}},
        { $lookup: {from: "cctx_profiles",localField: "msgs.author",foreignField: "_id",as: "msgs.author"}},
        { $lookup: {from: "cctx_profiles",localField: "msgs.sender",foreignField: "_id",as: "msgs.sender"}},
        { $unwind: {path:'$msgs.creator',preserveNullAndEmptyArrays: true}},
        { $unwind: {path:'$msgs.author',preserveNullAndEmptyArrays: true}},
        { $unwind: {path:'$msgs.sender',preserveNullAndEmptyArrays: true}},
        { $addFields: {
          userId:{$toString:"$users._id"},
          creatorId:{$toString:"$creator._id"},
          created_on: { "$toDouble": "$createdOn" },
        }}
      ],
      geoNearFields:["location"],
      projections:MSG_CHAIN_PROJECTIONS,
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
    const results = await Models.MsgChain.aggregate(pipeline);
    return { results };
  };
}
export default MsgChainsQueriesService;

const MSG_CHAIN_PROJECTIONS:any = {
  creator: {
    id: {$toString:"$creator._id"},
    name: "$creator.name",
    displayName: "$creator.displayName",
    app: "$creator.app",
    type: "$creator.type",
    img: "$creator.img.url",
  },
  users: {
    $cond: {
      if: { $eq: [{ $ifNull: ["$users", ""] }, ""] },
      then: null,
      else: {
        id: {$toString:"$users._id"},
        name: "$users.name",
        displayName: "$users.displayName",
        app: "$users.app",
        type: "$users.type",
        img: "$users.img.url",
      },
    },
  },
  msgs: {
    $cond: {
      if: { $eq: [{ $size: { $ifNull: ["$msgs", []] } }, 0] },
      then: [],
      else: "$msgs",
    },
  },
};