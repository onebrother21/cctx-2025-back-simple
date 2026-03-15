import Models from "@models";
import Types from "@types";
import Utils from '@utils';
import Services from '@services';

import DegenModels from "../../models";
import DegenTypes from "../../types";

const {MongooseAggHelpers} = Services;

export class DegenPlayersQueriesService {
  static queryPlayers = async (q:Types.IProfileQuery,s:string[],o?:any,t?:number) => {
    const {results} = await new MongooseAggHelpers<Types.IProfileQuery>({
      model:Models.Profile,
      query:q,
      select:s,
      opts:o,
      timestamp:t,
      prePipeline:[
        { $addFields: {playerId:"$creator._id"}},
      ],
      projections:PLAYER_PROJECTIONS,
      geoNearFields:["location"],
    }).runQuery();
    return {results};
  };
}
export default DegenPlayersQueriesService;

const PLAYER_PROJECTIONS = {
  creator:{
    id:"$creator._id",
    name:"$creator.name",
    displayName:"$creator.displayName",
    org:"$creator.org",
    img:"$creator.img.url",
  },
  /*
  admin:{
    id:"$admin._id",
    name:"$admin.name",
    displayName:"$admin.displayName",
    org:"$admin.org",
    img:"$admin.img.url",
  },
  pets: { 
    $filter:{ 
      input: "$log",
      as: "log",
      cond: { $not: { $in: ["$$log.status", [null, "",undefined]] } }
    }
  }
  */
};