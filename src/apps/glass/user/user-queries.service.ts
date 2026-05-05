import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';
import {IGlassUser} from "./user.types";

const {MongooseAggHelpers} = Services;

export class GlassUserQueriesService {
  static queryProfiles = async (q:Types.IProfileQuery,s:string[],o?:any,t:number = 0) => {
    const {results} = await new MongooseAggHelpers<Types.IProfileQuery>({
      model:Models.Profile,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {when_date: { "$toDouble": "$when" }}},
      ],
      projections:{},
      geoNearFields:["location"],
    }).runQuery();
    return {results};
  };
}
export default GlassUserQueriesService;