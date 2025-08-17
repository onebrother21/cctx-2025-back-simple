import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import Types from "../types";
import Utils from '../utils';

const ObjectId = Schema.Types.ObjectId;

const profileSchema = new Schema<Types.IProfile>({
  approvalUpdates:Utils.getStatusArraySchema(Object.values(Types.IApprovalStatuses),Types.IApprovalStatuses.REQUESTED),
  statusUpdates:Utils.getStatusArraySchema(Object.values(Types.IProfileStatuses),Types.IProfileStatuses.NEW),
  type:{type:String,enum:["app-admn","acct-admn"],required:true},
  name:{type: String,lowercase: true ,required:true},
  emails:[{type: String,lowercase: true}],
  addrs:[Utils.addressSchema],
  phns:[{type: String}],
  social:[Schema.Types.Mixed],
  sex:{type: String,enum: ["M","F","O"]},
  info:String,
  org:String,
  dob:Date,
  meta:Schema.Types.Mixed,
  img:{type:Object},
  bio:String,
  displayName:String,
  loc:{type:{type:String,default:"Point"},coordinates:[Number]},
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

profileSchema.plugin(uniqueValidator);
profileSchema.index({location:"2dsphere"});
profileSchema.methods.toAge = function toAge(){
  const dob = Utils.dateParserX(this.dob);
  if(dob){
    const yrInMS = 1000 * 60 * 60 * 24 * 365.25;
    const ageInMS = Date.now() - new Date(dob).getTime();
    const ageInYrs = ageInMS/yrInMS;
    const age = Number(ageInYrs.toFixed(0));
    return age;
  }
  else return null;
};
profileSchema.virtual('approval').get(function () {
  return this.approvalUpdates[this.approvalUpdates.length - 1].name;
});
profileSchema.methods.setApproval = async function (name,info,save){
  const approval = {name,time:new Date(),...(info?{info}:{})};
  this.approvalUpdates.push(approval);
  if(save) await this.save();
};
profileSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
profileSchema.methods.populateMe = async function () {
};
profileSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populateMe();
};
profileSchema.methods.preview = function (){
  return {
    displayName:this.displayName,
    name:this.name,
    id:this.id,
    img:this.img,
    org:this.org
  };
};
profileSchema.methods.json = function (isMe) {
  const json:Partial<Types.IProfileOTOAuth> =  {...this.preview() as any};
  json.id = this.id;
  json.type = this.type;
  json.status = this.status;
  json.name = this.name;
  json.org = this.org;
  json.age = this.toAge();
  json.meta = this.meta;
  json.bio = this.bio;
  json.img = this.img.url;
  json.displayName = this.displayName;
  json.location = this.loc.coordinates;
  if(isMe){
    json.approval = this.approval;
    json.emails = this.emails;
    json.addrs = this.addrs;
    json.phns = this.phns;
    json.social = this.social;
    json.sex = this.sex;
    json.info = this.info;
  }
  //json.createdOn = this.createdOn;
  //json.updatedOn = this.updatedOn;
  return json;
};
type Profile = Model<Types.IProfile,{},Types.IProfileMethods>;
const Profile:Profile = mongoose.model<Types.IProfile>('upcentric_profiles',profileSchema);
export default Profile;

/*

const adminSchema = new Schema<Types.ICaseAdmin>({
 ... profileSchema.obj,
  meta:{
    rateAmt:{type:Number,required:true},
    rateUnit:{type:String,enum:["hr","attempt"],required:true},
    mileageRate:Number,
  },
} as any,{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
adminSchema.methods.json = function () {
  return {
    id:this.id,
    name:this.name,
    org:this.org,
    emails:this.emails,
    addrs:this.addrs,
    phns:this.phns,
    social:this.social,
    info:this.info,
    meta:this.meta,
  };
};
type CaseAdmin = Model<Types.ICaseAdmin,{},Types.IProfileMethods>;
const CaseAdmin:CaseAdmin = mongoose.model<Types.ICaseAdmin>('caseAdmins',adminSchema);

const subjectMetaSchema = new Schema<Types.ICaseSubject["meta"]>({
  addrOnDateOfLoss:Utils.addressSchema,
  currentAddr:Utils.addressSchema,
  currentPhn:String,
  hasAtty:Boolean,
  attyInfo:{type:ObjectId,ref:"profiles"},
},{_id:false,timestamps:false});
const subjectSchema = new Schema<Types.ICaseSubject>({
  ...profileSchema.obj,
  type:{type: String,enum:["primary","secondary"],required:true},
  meta:subjectMetaSchema,
} as any,{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
subjectSchema.methods.json = function () {
  return {
    id:this.id,
    name:this.name,
    org:this.org,
    sex:this.sex,
    dob:this.dob,
    emails:this.emails,
    addrs:this.addrs,
    phns:this.phns,
    social:this.social,
    type:this.type,
    meta:this.meta,
  };
};
type CaseSubject = Model<Types.ICaseSubject,{},Types.IProfileMethods>;
const CaseSubject:CaseSubject = mongoose.model<Types.ICaseSubject>('caseSubjects',subjectSchema);
*/