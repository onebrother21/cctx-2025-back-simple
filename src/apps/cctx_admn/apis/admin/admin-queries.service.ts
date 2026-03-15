import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const {MongooseAggHelpers} = Services;

export class AdminQueriesService {
  static queryDevices = async (q:Types.IAppDeviceQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<Types.IAppDeviceQuery>({
      model:Models.AppDevice,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {
          creatorId: "$creator._id",
          created_on: { "$toDouble": "$createdOn" },
        }},
      ],
      projections:{},
      geoNearFields:["where"],
    }).runQuery();
    return {results};
  };
  static queryAppUsages = async (q:Types.IAppUsageQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<Types.IAppUsageQuery>({
      model:Models.AppUsage,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {
          when_date: { "$toDouble": "$when" },
        }},
      ],
      projections:{},
      geoNearFields:["where"],
    }).runQuery();
    return {results};
  };
}
export default AdminQueriesService;