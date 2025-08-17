import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import CDTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const subscriptionSchema = new Schema<CDTypes.ISubscription,Subscription,CDTypes.ISubscriptionMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(CDTypes.ISubscriptionStatuses),CDTypes.ISubscriptionStatuses.NEW),
  creator:{type:ObjectId,ref:"users",required:true},
  category: { type: String,required:true},
  type: { type: String,required:true},
  name: { type: String,required:true},
  description: { type: String,maxlength:140 },
  recurring:{type:Boolean},
  recurringInterval:{type:String,enum:["wk","2wk","3wk","m","3m","6m","yr"]},
  amt:{type:Number},
  dueOn:{type:Date,required:true},
  progress:{type:Number,min:0,max:100,default:() => 0},
  resolution:{ type: String,maxlength:140},
  reason:{ type: String},
  notes:[Utils.noteSchema],
  info:{type:Object},
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

subscriptionSchema.plugin(uniqueValidator);
subscriptionSchema.virtual('status').get(function () {return this.statusUpdates[this.statusUpdates.length - 1].name;});
subscriptionSchema.methods.setStatus = async function (name,info,save){
  const status = {name,time:new Date(),...(info?{info}:{})};
  this.statusUpdates.push(status);
  if(save) await this.save();
};
subscriptionSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
    category:this.category,
    type:this.type,
    name:this.name,
    description:this.description,
    status:this.status,
  };
};
subscriptionSchema.methods.json = function () {
  const json:Partial<CDTypes.ISubscription> =  {};
  json.id = this._id.toString();
  json.creator = (this.creator as any).preview,
  json.category = this.category;
  json.type = this.type;
  json.name = this.name;
  json.description = this.description;
  json.recurring = this.recurring;
  json.recurringInterval = this.recurringInterval;
  json.amt = this.amt;
  json.notes = this.notes.slice(-20);
  json.status = this.status;
  json.progress = this.progress;
  json.resolution = this.resolution;
  json.reason = this.reason;
  json.dueOn = this.dueOn;
  json.info = this.info;
  json.createdOn = this.createdOn;
  return json as CDTypes.ISubscription;
};

type Subscription = Model<CDTypes.ISubscription,{},CDTypes.ISubscriptionMethods>;
const Subscription:Subscription = mongoose.model<CDTypes.ISubscription>('subscriptions',subscriptionSchema);
export default Subscription;