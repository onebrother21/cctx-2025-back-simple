import PiMiaModels from '../../models';
import PiMiaTypes from "../../types";
import Models from '../../../../models';
import Types from "../../../../types";
import Utils from '../../../../utils';
import Services from '../../../../services';

const queryOpts = { new:true,runValidators: true,context:'query' };

export class SubscriptionsService {
  static createSubscription = async (user:Types.IUser,newSubscription:Partial<PiMiaTypes.ISubscription>) =>  {
    const subscription = new PiMiaModels.Subscription({creator:user.id,location:user.location,...newSubscription});
    await subscription.save();
    await subscription.populate("creator");
    return {subscription};
  };
  static getSubscriptionById = async (subscriptionId:string) => {
    const subscription = await PiMiaModels.Subscription.findById(subscriptionId);
    if(!subscription) throw new Utils.AppError(422,'Requested subscription not found');
    await subscription.populate("creator");
    return {subscription};
  };
  static updateSubscription = async (subscriptionId:string,updates:any) => {
    const subscription = await PiMiaModels.Subscription.findByIdAndUpdate(subscriptionId,{ $set: updates },{new:true,runValidators:true});
    if (!subscription) throw new Utils.AppError(422,'Requested subscription not found');
    await subscription.populate("creator");
    return {subscription};
  };
  static updateSubscriptionStatus = async (subscriptionId:string,status:PiMiaTypes.ISubscriptionStatuses,info?:any) => {
    const subscription = await PiMiaModels.Subscription.findById(subscriptionId);
    if (!subscription) throw new Utils.AppError(422,'Requested subscription not found');
    await subscription.setStatus(status,info,true);
    await subscription.populate("creator");
    return {subscription};
  };
  static deleteSubscription = async (subscriptionId:string) => {
    const subscription = await PiMiaModels.Subscription.findByIdAndDelete(subscriptionId);
    if (!subscription) throw new Utils.AppError(422,'Requested subscription not found');
    return {ok:true};
  };
  static getSubscriptionsByUser = async (userId:string) => {
    const subscriptions = await PiMiaModels.Subscription.find({ creator:userId });
    return {results:subscriptions};
  };
  static querySubscriptions = async ({location,...query_}:any,select:string[],opts?:any,timestamp?:number) => {
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
    const results_ = await PiMiaModels.Subscription.aggregate(pipeline);
    const results = !location?results_:results_.map(o => ({
      ...o,
      ...(select.includes("dist")?{dist:Utils.calculateDistance(pts,o.loc,{unit,toFixed:4})}:{}),
      ...(select.includes("distUnit")?{distUnit:unit}:{}),
    }));
    results.sort(Utils.sortBy("dist"));
    return { results };
  };
}