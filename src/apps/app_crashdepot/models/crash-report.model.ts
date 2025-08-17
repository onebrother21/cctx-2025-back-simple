import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import CDTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const crashReportSchema = new Schema<CDTypes.ICrashReport,CrashReport,CDTypes.ICrashReportMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(CDTypes.ICrashReportStatuses),CDTypes.ICrashReportStatuses.NEW),
  creator:{type:ObjectId,ref:"users",required:true},
  type: { type: String,required:true,enum:["browser","mobile-app","service"]},
  name: { type: String,required:true},
  desc: { type: String,maxlength:140 },
  resolution:{ type: String,maxlength:140},
  reason:{ type: String},
  tags:[{type:String}],
  notes:[Utils.noteSchema],
  info:{type:Object},
},{timestamps:true});

crashReportSchema.plugin(uniqueValidator);
crashReportSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
crashReportSchema.methods.setStatus = async function (name,info,save){
  const status = {name,time:new Date(),...(info?{info}:{})};
  this.statusUpdates.push(status);
  if(save) await this.save();
};
crashReportSchema.methods.json = function () {
  return {
    id:this._id.toString(),
    type:this.type,
    name:this.name,
    desc:this.desc,
    status:this.status,
    creator:(this.creator as any).preview,
    notes:this.notes.slice(-20),
    tags:this.tags.slice(-20),
    info:this.info,
    createdOn:this.createdOn,
  };
};

type CrashReport = Model<CDTypes.ICrashReport,{},CDTypes.ICrashReportMethods>;
const CrashReport:CrashReport = mongoose.model<CDTypes.ICrashReport>('crashReports',crashReportSchema);
export default CrashReport;