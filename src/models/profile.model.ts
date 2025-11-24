import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import Types from "../types";
import Utils from '../utils';

const ObjectId = Schema.Types.ObjectId;

const profileContactSchema = new Schema<Types.IProfile["contact"]>({
  emails:[{type: String,lowercase: true}],
  addrs:[Utils.addressSchema],
  phns:[{type: String}],
  socials:[Schema.Types.Mixed],
},{timestamps:false,_id:false});
const profileSchema = new Schema<Types.IProfile,Profile,Types.IProfileMethods>({
  creator:{type:ObjectId,required:true,ref:"cctx_users"},
  status:{type: String,enum:Object.values(Types.IProfileStatuses)},
  app:{type: String,lowercase: true ,required:true},
  type:{type:String,enum:Object.values(Types.IProfileRoles),required:true},
  name:{type: String,lowercase: true ,required:true},
  displayName:String,
  info:Schema.Types.Mixed,
  meta:Schema.Types.Mixed,
  org:String,
  img:Object,
  bio:String,
  motto:String,
  contact:profileContactSchema,
},{timestamps:{createdAt:"createdOn"}});

profileSchema.plugin(uniqueValidator);
profileSchema.index({location:"2dsphere"});
profileSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
profileSchema.methods.populateMe = async function () {};

profileSchema.methods.preview = function (){
  return {
    id:this.id,
    displayName:this.displayName,
    name:this.name,
    org:this.org,
    img:this.img?.url || "",
    app:this.app,
    type:this.type,
  };
};
profileSchema.methods.json = function (isMe) {
  const json:Partial<Types.IProfileJsonAuth> =  {...this.preview() as any};
  json.creator = this.creator.username;
  json.app = this.app;
  json.type = this.type;
  json.status = this.status;
  json.age = this.creator.toAge();
  json.memberSince = this.createdOn;
  json.meta = this.meta;
  json.bio = this.bio;
  if(isMe){
    json.approval = this.approval;
    json.contact = this.contact;
    json.info = this.info;
  }
  //json.updatedOn = this.updatedOn;
  return json as Types.IProfileJsonAuth;
};
type Profile = Model<Types.IProfile,{},Types.IProfileMethods>;
const Profile:Profile = mongoose.model<Types.IProfile>('cctx_profiles',profileSchema);
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