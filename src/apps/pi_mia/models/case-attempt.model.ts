import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PiMiaTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PiMiaTypes.ICaseAttemptStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const caseAttemptSchema = new Schema<PiMiaTypes.ICaseAttempt,CaseAttempt,PiMiaTypes.ICaseAttemptMethods>({
  status:{type:String,enum:Object.values(PiMiaTypes.ICaseAttemptStatuses),default:NEW},
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  start:{type:Date,required:true},
  end:Date,
  log:[Schema.Types.Mixed],
  outcome:String,
  meta:{
    mileage:Number,
    mileageAdj:Number,
    elapsedTime:Number,
  },
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

caseAttemptSchema.plugin(uniqueValidator);
caseAttemptSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
caseAttemptSchema.methods.populateMe = async function () {
  //await this.populate(".author");
};
caseAttemptSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
caseAttemptSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    creator:(this.creator as any).preview(),
    createdOn:this.createdOn,
    start:this.start,
    end:this.end,
    log:this.log.slice(-20).map(n => ({
      ...n
    }) as any),
    info:this.info,
    meta:this.meta,
  };
};

type CaseAttempt = Model<PiMiaTypes.ICaseAttempt,{},PiMiaTypes.ICaseAttemptMethods>;
const CaseAttempt:CaseAttempt = mongoose.model<PiMiaTypes.ICaseAttempt>('pimia_case_attempts',caseAttemptSchema);
export default CaseAttempt;