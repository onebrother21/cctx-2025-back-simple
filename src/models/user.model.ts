import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "../types";
import Utils from '../utils';

import AppUsage from "./app-usage.model";

const ObjectId = Schema.Types.ObjectId;

const nameSchema = new Schema({
  first: { type: String},
  last: { type: String},
},{_id:false,timestamps:false});
const profileRefSchema = new Schema({
  name:{type:String,required:true},
  obj:{type:ObjectId,ref:"cctx_profiles",required:true},
},{_id:false,timestamps:false});

const userSchema = new Schema<Types.IUser,User,Types.IUserMethods>({
  status:{type: String,enum:Object.values(Types.IUserStatuses)},
  name:{type:nameSchema},
  email:{type: String, unique: true, lowercase: true ,required:true},
  mobile:{type: String, unique: true ,sparse:true},
  dob:Date,
  info:Object,
  meta:Object,
  settings:Object,
  pin: { type: String },
  reset:String,
  verification:String,
  verificationSent:Date,
  verificationType:{type: String,enum:Object.values(Types.IContactMethods)},
  username:{type:String,sparse:true},
  profiles:[profileRefSchema],
  devices:[{type:ObjectId,ref:"cctx_devices"}],
  loc:{type:{type:String,default:"Point"},coordinates:[Number]},
},{timestamps:{createdAt:"createdOn"}});

userSchema.plugin(uniqueValidator,{message:'{PATH} is already taken.'});
userSchema.methods.toAge = function toAge(){
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
userSchema.methods.getUserContactByMethod = function(method:Types.IContactMethods){
  let to: string | null = null;
  switch (method) {
    case 'email':
      to = this.email || null;
      break;
    case 'sms':
      to = this.mobile || null;
      break;
    case 'push':
      to = this.pushToken || null;
      break;
    case 'in-app':
      to = this.socketId || null;
      break;
    case 'auto':
      try {
        // First attempt to send via WebSocket (check if socketId is available)
        to = this.socketId || null;
      }
      catch (err) {
        // If WebSocket fails, fallback to push (use pushToken)
        to = this.pushToken || null;
      }
      break;
    default:throw new Error('Unknown notification method');
  }
  if (!to) {
    throw new Error(`User does not have a valid ${method} to send notification.`);
  }
  return to;
};
userSchema.virtual('fullname').get(function fullName() {return this.name?this.name.first + ' ' + this.name.last:"";});
userSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
userSchema.methods.populateMe = async function () {
  const populations = [{path:"profiles.obj",populate:"creator"}];
  await this.populate(populations);
};
userSchema.methods.getProfile = function (){
  return this.profiles.find(ref => ref.name == this.role)?.obj.json() || null;
}
userSchema.methods.preview = function (){
  return {
    fullname:this.fullname,
    username:this.username,
    id:this.id,
    location:this.loc?.coordinates.toString() || "",
  };
};
userSchema.methods.json = function (auth) {
  const p = this.getProfile();
  const json:Types.IUserJson =  {...this.preview() as any};
  if(auth) {
    json.name = this.name,
    json.email = this.email,
    json.username = this.username;
    json.status = this.status;
    json.info = this.info;
    json.meta = this.meta;
    json.settings = this.settings;
    json.profile = p;
  };
  return json;
};

type User = Model<Types.IUser,{},Types.IUserMethods>;
const User:User = mongoose.model<Types.IUser>('cctx_users',userSchema);
export default User;