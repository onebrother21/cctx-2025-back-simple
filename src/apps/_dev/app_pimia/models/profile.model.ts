import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import PiMiaTypes from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;

const profileSchema = new Schema<PiMiaTypes.IProfile>({
  type:{type:String,enum:["subject","vendor","client","contact","admin"],required:true},
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
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
profileSchema.plugin(uniqueValidator);
profileSchema.methods.json = function () {
  const pKeys = ["_id","__v","createdAt","updatedAt","createdOn","updatedOn"];
  const m = this.toObject();
  const o = Object.keys(m).reduce((o,k) => pKeys.includes(k)?o:({...o,[k]:m[k]}),{id:m._id.toString()});
  return o as Partial<PiMiaTypes.IProfile>;
};
type Profile = Model<PiMiaTypes.IProfile,{},PiMiaTypes.IProfileMethods>;
const Profile:Profile = mongoose.model<PiMiaTypes.IProfile>('profiles',profileSchema);
export default Profile;

/*

const adminSchema = new Schema<PiMiaTypes.ICaseAdmin>({
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
type CaseAdmin = Model<PiMiaTypes.ICaseAdmin,{},PiMiaTypes.IProfileMethods>;
const CaseAdmin:CaseAdmin = mongoose.model<PiMiaTypes.ICaseAdmin>('caseAdmins',adminSchema);

const subjectMetaSchema = new Schema<PiMiaTypes.ICaseSubject["meta"]>({
  addrOnDateOfLoss:Utils.addressSchema,
  currentAddr:Utils.addressSchema,
  currentPhn:String,
  hasAtty:Boolean,
  attyInfo:{type:ObjectId,ref:"profiles"},
},{_id:false,timestamps:false});
const subjectSchema = new Schema<PiMiaTypes.ICaseSubject>({
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
type CaseSubject = Model<PiMiaTypes.ICaseSubject,{},PiMiaTypes.IProfileMethods>;
const CaseSubject:CaseSubject = mongoose.model<PiMiaTypes.ICaseSubject>('caseSubjects',subjectSchema);
*/