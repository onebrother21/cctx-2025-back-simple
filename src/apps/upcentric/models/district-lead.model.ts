import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import UTypes from "../types";
import Utils from '../../../utils';
import Models from '../../../models';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = UTypes.IDistrictLeadStatuses;

const districtLeadSchema = new Schema<UTypes.IDistrictLead,DistrictLead,UTypes.IDistrictLeadMethods>({
  log:{type:[{type:ObjectId,ref:"upcentric_activity"}],default:() => []},
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
},{timestamps:{createdAt:"createdOn"}});

districtLeadSchema.plugin(uniqueValidator);
districtLeadSchema.virtual('status').get(function () {
  const log = this.log as AppActivityUpdate[];
  const idx = Utils.findReverseIndex(log,o => !!o.status);
  return log[idx].status;
});
districtLeadSchema.methods.saveMe = async function (o){
  if(o) {
    const n = await Models.AppActivity.create(o);
    this.log.push(n._id as any);
  }
  await this.save();
  await this.populateMe();
};
districtLeadSchema.methods.populateMe = async function () {
  await this.populate("creator log");
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

type DistrictLead = Model<UTypes.IDistrictLead,{},UTypes.IDistrictLeadMethods>;
const DistrictLead:DistrictLead = mongoose.model<UTypes.IDistrictLead>('upcentric_districtLeads',districtLeadSchema);
export default DistrictLead;