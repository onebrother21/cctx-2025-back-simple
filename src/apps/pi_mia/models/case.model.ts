import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Utils from '@utils';
import Types from "@types";
import PiMiaTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PiMiaTypes.ICaseStatuses;

const detailsSchema = new Schema<PiMiaTypes.ICaseDetails>({
  dateOfAccident:Date,
  vehicleDesc:String,
  ownerOfCar:String,
  subjectHousehold:[{type:ObjectId,ref:"cctx_profiles"}],
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
const caseSchema = new Schema<PiMiaTypes.ICase,Case,PiMiaTypes.ICaseMethods>({
  status:{type:String,enum:Object.values(PiMiaTypes.ICaseStatuses),default:NEW},
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  rush:{type:Boolean},
  objective:{type:String,enum:["full","adoption","canvas","serivce"],required:true},
  reqNo:String,
  startOn:Date,
  dueOn:Date,
  assignedOn:Date,
  client:{type:ObjectId,ref:"cctx_profiles",required:true},
  vendor:{type:ObjectId,ref:"cctx_profiles",required:true},
  subjects:{
    type:[{type:ObjectId,ref:"cctx_profiles",required:true}],
    validate: {
      validator: function (val) {return Array.isArray(val) && val.length > 0;},
      message: 'At least one case subject is required.'
    },
    required:true
  },
  admin:{type:ObjectId,ref:"cctx_profiles"},
  notes:[Utils.noteSchema],
  info:detailsSchema,
  files:[Utils.attachmentSchema],
  attempts:[{type:ObjectId,ref:"pimia_case_attempts",required:true}],
  invoice:{type:ObjectId,ref:"pimia_invoices"}
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

caseSchema.plugin(uniqueValidator);
caseSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
caseSchema.methods.populateMe = async function () {
  await this.populate("creator client vendor subjects admin notes.author attempts invoice");
};
caseSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
caseSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    creator:this.creator.preview() as any,
    reqNo:this.reqNo,
    assignedOn:this.assignedOn,
    objective:this.objective,
    rush:this.rush,
    startOn:this.startOn,
    dueOn:this.dueOn,
    subjects:this.subjects.map(o => o.json() as any),
    client:this.client.json() as any,
    vendor:this.vendor.json() as any || null,
    admin:this.admin?.json() as any || null,
    notes:this.notes.slice(-20).map(n => ({
      author:n.author.preview() as any,
      body:n.body,
      time:n.time,
    }) as any),
    info:this.info,
    meta:this.meta,
    files:this.files,
    attempts:this.attempts.map(o => o.json() as any),
    invoice:this.invoice.json() as any,
    resolution:this.resolution,
  };
};

type Case = Model<PiMiaTypes.ICase,{},PiMiaTypes.ICaseMethods>;
const Case:Case = mongoose.model<PiMiaTypes.ICase>('pimia_cases',caseSchema);
export default Case;