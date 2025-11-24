import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import UTypes from "../types";
import Utils from '../../../utils';
import Models from '../../../models';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = UTypes.IFinancialLineItemStatuses;

const lineItemSchema = new Schema<UTypes.IFinancialLineItem,FinancialLineItem,UTypes.IFinancialLineItemMethods>({
  log:{type:[{type:ObjectId,ref:"upcentric_activity"}],default:() => []},
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
  const log = this.log as AppActivityUpdate[];
  const idx = Utils.findReverseIndex(log,o => !!o.status);
  return log[idx].status;
});
lineItemSchema.methods.saveMe = async function (o){
  if(o) {
    const n = await Models.AppActivity.create(o);
    this.log.push(n._id as any);
  }
  await this.save();
  await this.populateMe();
};
lineItemSchema.methods.populateMe = async function () {
  await this.populate("creator log");
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
    notes:this.log.filter((o:any) => !!o.msg).slice(-20),
    reason:this.reason,
    meta:this.meta,
    createdOn:this.createdOn,
    creator:(this.creator as any).preview,
  };
};

type FinancialLineItem = Model<UTypes.IFinancialLineItem,{},UTypes.IFinancialLineItemMethods>;
const FinancialLineItem:FinancialLineItem = mongoose.model<UTypes.IFinancialLineItem>('upcentric_lineItems',lineItemSchema);
export default FinancialLineItem;