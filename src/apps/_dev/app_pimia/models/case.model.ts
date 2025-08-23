import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import PiMiaTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const detailsSchema = new Schema<PiMiaTypes.ICaseDetails>({
  dateOfAccident:Date,
  vehicleDesc:String,
  ownerOfCar:String,
  subjectHousehold:[{type:ObjectId,ref:"profiles"}],
  subjectInjuries:String,
  permissionToDrive:Boolean,
  insurance:[{
    user:String,
    exists:Boolean,
    claimNo:String,
    adjuster:String,
  }],

  isMacpApp:Boolean,
  isAffidavit:Boolean,
  isProofOfService:String,
  isSignatureReq:Boolean,
  isServiceReq:Boolean,
  isNotaryReq:Boolean,
  isQNAReq:Boolean,
  
  macpAppCompleted:Schema.Types.Mixed,
  affidavitSigned:Date,
  affidavitSent:Date,
  proofOfServiceAttained:Schema.Types.Mixed,
  signatureAttained:Schema.Types.Mixed,
  serviceRendered:Schema.Types.Mixed,
  notaryCompleted:Date,
  qnaCompleted:Date,
  
  questions:[String],
  answers:[String],
},{_id:false,timestamps:false});
const attemptSchema = new Schema<PiMiaTypes.ICaseAttempt>({
  start:{type:Date,required:true},
  end:Date,
  log:[Schema.Types.Mixed],
  outcome:String,
  meta:{
    mileage:Number,
    mileageAdj:Number,
    elapsedTime:Number,
  },
},{_id:false,timestamps:false});
const invoiceSchema = new Schema<PiMiaTypes.ICaseInvoice>({
  title:String,
  unit:String,
  items:[Schema.Types.Mixed],
  subtotal:Number,
  tax:Number,
  total:Number,
  meta:{
    submitted:Date,
    sent:Date,
    received:Date,
    paid:Date,
  },
},{_id:false,timestamps:true});
const caseSchema = new Schema<PiMiaTypes.ICase,Case,PiMiaTypes.ICaseMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(PiMiaTypes.ICaseStatuses),PiMiaTypes.ICaseStatuses.NEW),
  creator:{type:ObjectId,ref:"users",required:true},
  rush:{type:Boolean},
  objective:{type:String,enum:["full","adoption","canvas","serivce"],required:true},
  reqNo:String,
  dueOn:Date,
  assignedOn:Date,
  client:{type:ObjectId,ref:"profiles",required:true},
  vendor:{type:ObjectId,ref:"profiles",required:true},
  subjects:{
    type:[{type:ObjectId,ref:"profiles",required:true}],
    validate: {
      validator: function (val) {return Array.isArray(val) && val.length > 0;},
      message: 'At least one case subject is required.'
    },
    required:true
  },
  admin:{type:ObjectId,ref:"profiles"},
  notes:[Schema.Types.Mixed],
  meta:detailsSchema,
  files:[Utils.attachmentSchema],
  attempts:[attemptSchema],
  invoice:invoiceSchema,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

caseSchema.plugin(uniqueValidator);
caseSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
caseSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populate("creator client vendor subjects admin");
};
caseSchema.methods.populateMe = async function () {
  await this.populate("creator client vendor subjects admin");
};
caseSchema.methods.json = function () {
  return {
    id:this.id,
    reqNo:this.reqNo,
    assignedOn:this.assignedOn,
    objective:this.objective,
    rush:this.rush,
    dueOn:this.dueOn,
    desc:this.desc,
    status:this.status,
    creator:(this.creator as any).preview,
    info:this.info,
    createdOn:this.createdOn,
    subjects:this.subjects.map(o => o.json() as any),
    client:this.client.json() as any,
    vendor:this.vendor.json() as any,
    admin:this.admin?.json() as any || null,
    notes:this.notes,
    meta:this.meta,
    attempts:this.attempts,
    files:this.files,
    invoice:this.invoice,
  };
};

type Case = Model<PiMiaTypes.ICase,{},PiMiaTypes.ICaseMethods>;
const Case:Case = mongoose.model<PiMiaTypes.ICase>('cases',caseSchema);
export default Case;