import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

const {MongooseAggHelpers} = Utils;

export class AuthQueriesService {
  static queryUsers = async (q:Types.IUserQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<Types.IUserQuery>({
      model:Models.User,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {created_on: { "$toDouble": "$createdOn" }}},
      ],
      geoNearFields:["location"],
      projections:USER_PROJECTIONS,
    }).runQuery();
    return {results};
  };
}
export default AuthQueriesService;

 const USER_PROJECTIONS:any = {};