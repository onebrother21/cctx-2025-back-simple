import Models from '../../../../models';
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';

const queryOpts = { new:true,runValidators: true,context:'query' };

export class TradingPlanMgmtService {
  static createTradingPlan = async (user:Types.IUser,newTradingPlan:Partial<Types.ITradingPlan>) =>  {
    const plan = new Models.TradingPlan({creator:user.id,location:user.location,...newTradingPlan});
    await plan.save();
    await plan.populate("creator");
    return {plan};
  };
  static getTradingPlanById = async (planId:string) => {
    const plan = await Models.TradingPlan.findById(planId);
    if(!plan) throw new Utils.AppError(422,'Requested plan not found');
    await plan.populate("creator");
    return {plan};
  };
  static updateTradingPlan = async (planId:string,updates:any) => {
    const plan = await Models.TradingPlan.findByIdAndUpdate(planId,{ $set: updates },{new:true,runValidators:true});
    if (!plan) throw new Utils.AppError(422,'Requested plan not found');
    await plan.populate("creator");
    return {plan};
  };
  static updateTradingPlanStatus = async (planId:string,status:Types.ITradingPlanStatuses,info?:any) => {
    const plan = await Models.TradingPlan.findById(planId);
    if (!plan) throw new Utils.AppError(422,'Requested plan not found');
    await plan.setStatus(status,info,true);
    await plan.populate("creator");
    return {plan};
  };
  static deleteTradingPlan = async (planId:string) => {
    const plan = await Models.TradingPlan.findByIdAndDelete(planId);
    if (!plan) throw new Utils.AppError(422,'Requested plan not found');
    return {ok:true};
  };
  static getTradingPlansByUser = async (userId:string) => {
    const plans = await Models.TradingPlan.find({ creator:userId });
    return {results:plans};
  };
  static queryTradingPlans = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
    const page = opts?.currentPage || 1; // Default to page 1
    const limit = opts?.limit || 10; // Default to 10 results per page
    const skip = (page - 1) * limit; // Calculate how many records to skip
    const sortField = opts?.sort || 'createdOn';
    const sortOrder = opts?.order || -1;

    const {pts,radius = 5,unit = "mi"} = location || {};
    const searchRadius = radius/(unit == "mi"?3963.2:6371);
    const locationQ = {location:{"$geoWithin":{"$centerSphere":[pts,searchRadius]}}};

    const query = {...query_,...(location?locationQ:{})};
    const pipeline:any[] = [];
    
    pipeline.push(
      { $lookup: {from: "users",localField: "creator",foreignField: "_id",as: "creator"}},
      { $addFields: {
        created_on: { "$toDouble": "$createdOn" },
        status: {$arrayElemAt:["$statusUpdates.name",-1]}//last status update
      }},
      { $match: query },
      { $group: {
        _id: "$_id",
        creator: { $first: "$creator" },
        createdOn: { $first: "$createdOn" },
        expiration: { $first: "$expiration" },
        name:{ $first:"$name" },
        status: { $first: "$status" },
        loc:{ $first:"$location.coordinates"},
        rating:{$first:"$rating"},
        type:{$first:"$type"},
        price:{$first:"$price"},
        //reviews:{$first:"$reviews"},
      }},
      { $skip: skip },
      { $limit: limit },
      { $sort: { [sortField]: sortOrder } },  // Sorting stage
      { $project: {
        _id: 0,
        ...(select.includes("id")?{id:"$_id"}:{}),
        ...(select.includes("status")?{status:1}:{}),
        ...(select.includes("type")?{type:1}:{}),
        ...(select.includes("name")?{name:1}:{}),
        ...(select.includes("createdOn")?{createdOn:1}:{}),
        ...(select.includes("expiration")?{expiration:1}:{}),
        ...(select.includes("loc")?{loc:1}:{}),
        ...(select.includes("rating")?{rating:1}:{}),
        ...(select.includes("ratingCt")?{ratingCt:{ $size:"$reviews"}}:{}),
        ...(select.includes("price")?{price:"$price.amt"}:{}),
        ...(select.includes("priceUnit")?{priceUnit:{ $concat: [ "$price.curr","/","$price.per" ] }}:{}),
        ...(select.includes("creator")?{creator: { id: "$creator._id",name: "$creator.name",username:"$creator.displayName" }}:{}),
      }}
    );
    const results_ = await Models.TradingPlan.aggregate(pipeline);
    const results = !location?results_:results_.map(o => ({
      ...o,
      ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.loc,{unit,toFixed:4})}:{}),
      ...(select.includes("distUnit")?{distUnit:unit}:{}),
    }));
    results.sort(Utils.sortBy("dist"));
    return { results };
  };
}