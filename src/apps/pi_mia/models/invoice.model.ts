import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PiMiaTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PiMiaTypes.IInvoiceStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const invoiceItemSchema = new Schema<PiMiaTypes.IInvoiceItem>({
  type:{type:String,enum:["hr","attempt"]},
  desc:String,
  actions:[String],
  duration:String,
  durationStr:String,
  serviceCharges:Number,
  serviceChg:String,
  mileage:Number,
  mileageStr:String,
  mileageCharges:Number,
  mileageChg:String,
  mileageAdj:Number,
  mileageAdjStr:String,
  mileageAdjCharges:Number,
  mileageAdjChg:String,
  totalCharges:Number,
  totalChg:String,
},{_id:false,timestamps:true});
const invoiceSchema = new Schema<PiMiaTypes.IInvoice,Invoice,PiMiaTypes.IInvoiceMethods>({
  status:{type:String,enum:Object.values(PiMiaTypes.IInvoiceStatuses),default:NEW},
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  caseId:String,
  invoiceNo:String,
  title:String,
  unit:{type:String,enum:["hr","attempt"]},
  items:[invoiceItemSchema],
  subtotal:Number,
  tax:Number,
  total:Number,
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

invoiceSchema.plugin(uniqueValidator);
invoiceSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
invoiceSchema.methods.populateMe = async function () {
  await this.populate("creator client vendor subjects admin notes.author attempts");
};
invoiceSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
invoiceSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    creator:this.creator.preview() as any,
    title:this.title,
    unit:this.unit,
    items:this.items,
    subtotal:this.subtotal,
    tax:this.tax,
    total:this.total,
    caseId:this.caseId,
    info:this.info,
    meta:this.meta,
  };
};

type Invoice = Model<PiMiaTypes.IInvoice,{},PiMiaTypes.IInvoiceMethods>;
const Invoice:Invoice = mongoose.model<PiMiaTypes.IInvoice>('pimia_invoices',invoiceSchema);
export default Invoice;