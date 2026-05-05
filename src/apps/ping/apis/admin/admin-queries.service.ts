import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import PingModels from "../../models";
import PingTypes from "../../types";

const {MongooseAggHelpers} = Services;

export class AdminQueriesService {
  static queryProfiles = async (q:Types.IProfileQuery,s:string[],o?:any,t:number = 0) => {
    const {results} = await new MongooseAggHelpers<Types.IProfileQuery>({
      model:Models.Profile,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {
          creatorId:{$toString:"$creator._id"},
          created_on: { "$toDouble": "$createdOn" },
        }},
      ],
      projections:{},
      geoNearFields:["location"],
    }).runQuery();
    return {results};
  };
}
export default AdminQueriesService;