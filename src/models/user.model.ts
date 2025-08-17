import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "../types";
import Utils from '../utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.IUserStatuses;

const nameSchema = new Schema({
  first: { type: String},
  last: { type: String},
},{_id:false,timestamps:false});
const profilesSchema = new Schema({
  "app-admn":{type:ObjectId,ref:"upcentric_profiles"},
  "acct-admn":{type:ObjectId,ref:"upcentric_profiles"},
},{_id:false,timestamps:false});

const userSchema = new Schema<Types.IUser,User,Types.IUserMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(Types.IUserStatuses),NEW),
  name:{type:nameSchema},
  email:{type: String, unique: true, lowercase: true ,required:true},
  mobile:{type: String, unique: true ,sparse:true},
  dob:{type:Date},
  info:{type:Object},
  meta:{type:Object},
  pin: { type: String },
  //prefs:prefsSchema,
  reset:{type:String},
  verification:{type:String},
  verificationSent:{type:Date},
  username:{type:String,sparse:true},
  profiles:{type:profilesSchema,default:{}},
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

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
userSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
userSchema.methods.populateMe = async function () {
  const profileNames = Object.keys((this.profiles.schema as any).obj).map(k => "profiles."+k).join(" ");
  await this.populate(profileNames);
};
userSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populateMe();
};
userSchema.methods.getProfile = function (){
  return this.role && this.profiles[this.role]?this.profiles[this.role].json():null;
}
userSchema.methods.preview = function (){
  const p = this.getProfile();
  return {
    fullname:this.fullname,
    username:this.username,
    id:this.id,
    location:p?p.location:"",
    img:p?p.img?.url||"":"",
  };
};
userSchema.methods.json = function (auth) {
  const p = this.getProfile();
  const json:Types.IUserOTO =  {...this.preview() as any};
  if(auth) {
    json.name = this.name,
    json.email = this.email,
    json.username = this.username;
    json.status = this.status;
    json.age = this.toAge();
    json.memberSince = this.createdOn as Date;
    json.lastUse = (this.meta?.lastUse as Date) || null;
    json.info = this.info;
    json.profile = p;
  };
  return json;
};

type User = Model<Types.IUser,{},Types.IUserMethods>;
const User:User = mongoose.model<Types.IUser>('cctx_users',userSchema);
export default User;