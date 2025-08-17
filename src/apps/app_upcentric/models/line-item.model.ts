import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import UpcentricTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const lineItemSchema = new Schema<UpcentricTypes.IFinancialLineItem,FinancialLineItem,UpcentricTypes.IFinancialLineItemMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(UpcentricTypes.IFinancialLineItemStatuses),UpcentricTypes.IFinancialLineItemStatuses.NEW),
  creator:{type:ObjectId,ref:"users",required:true},
  type:String,
  title:String,
  amount:Number,
  category:String,
  period:String,// e.g., 'monthly', 'quarterly'
  notes: [String],
  meta:Object,
  reason:String,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

lineItemSchema.plugin(uniqueValidator);
lineItemSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
lineItemSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populate("creator");
};
lineItemSchema.methods.populateMe = async function () {
  await this.populate("creator");
};
lineItemSchema.methods.json = function () {
  return {
    id:this.id,
    type:this.type,
    desc:this.desc,
    status:this.status,
    info:this.info,
    title:this.title,
    amount:this.amount,
    category:this.category,
    period:this.period, // e.g., 'monthly', 'quarterly'
    notes:this.notes,
    reason:this.reason,
    meta:this.meta,
    createdOn:this.createdOn,
    creator:(this.creator as any).preview,
  };
};

type FinancialLineItem = Model<UpcentricTypes.IFinancialLineItem,{},UpcentricTypes.IFinancialLineItemMethods>;
const FinancialLineItem:FinancialLineItem = mongoose.model<UpcentricTypes.IFinancialLineItem>('upcentric_lineItems',lineItemSchema);
export default FinancialLineItem;