import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import PiMiaTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const districtLeadSchema = new Schema<PiMiaTypes.IDistrictLead,DistrictLead,PiMiaTypes.IDistrictLeadMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(PiMiaTypes.IDistrictLeadStatuses),PiMiaTypes.IDistrictLeadStatuses.NEW),
  creator:{type:ObjectId,ref:"users",required:true},
  name:String,
  region:Number,
  county:String,
  studentCt:Number,
  msSchoolCt:Number,
  hsSchoolCt:Number,
  infoAsOf:String,
  vendorInfo:{
    dept:String,
    contactName:String,
    contactEmail:String,
    contactPhn:String,
    role:String,
  }
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

districtLeadSchema.plugin(uniqueValidator);
districtLeadSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
districtLeadSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populate("creator");
};
districtLeadSchema.methods.populateMe = async function () {
  await this.populate("creator");
};
districtLeadSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    creator:(this.creator as any).preview,
    info:this.info,
    createdOn:this.createdOn,
    name:this.name,
    region:this.region,
    county:this.county,
    studentCt:this.studentCt,
    msSchoolCt:this.msSchoolCt,
    hsSchoolCt:this.hsSchoolCt,
    infoAsOf:this.infoAsOf,
    vendorInfo:this.vendorInfo,
  };
};

type DistrictLead = Model<PiMiaTypes.IDistrictLead,{},PiMiaTypes.IDistrictLeadMethods>;
const DistrictLead:DistrictLead = mongoose.model<PiMiaTypes.IDistrictLead>('upcentric_districtLeads',districtLeadSchema);
export default DistrictLead;