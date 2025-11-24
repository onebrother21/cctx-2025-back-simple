import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "../types";
import Utils from '../utils';

const appUsageSchema = new Schema<Types.IAppUsage,AppUsage,Types.IAppUsageMethods>({
  who:{type:String,required:true},
  what:{ type: Schema.Types.Mixed,required:true},
  which:String,
  where:String,
  when: { type: Date,default:() => Date.now()},
  how:String,
  to:String,
  with:String,
  why:String,
},{timestamps:false});
appUsageSchema.plugin(uniqueValidator);
appUsageSchema.static("make",async function (
  user:Types.IUser|"sys-admn",
  action:string|number,
  dataObj?:Partial<Types.IAppUsage & LocationObj>,
){
  const isSysAdmin = user == "sys-admn";
  const device = !isSysAdmin?user.device:null;
  const {loc,...data} = dataObj || {};
  const n = new AppUsage({
    who:isSysAdmin?user:`u/${user._id}`,
    what:action,
    when:new Date(),
    ...device?{how:`${device.device?.model||"Unknown"}/${device.lastAddr}`}:{},
    ...loc?{where:`${loc[0]}X${loc[1]}`}:{},
    ...data,
  });
  await n.save();
});
appUsageSchema.methods.saveMe = async function (){await this.save();};
appUsageSchema.methods.json = function () {
  const json:Partial<Types.IAppUsage> =  {};
  json.who = this.who;
  json.what = this.what;
  json.which = this.which;
  json.when = this.when;
  json.where = this.where;
  json.how = this.how;
  json.to = this.to;
  json.with = this.with;
  json.why = this.why;
  return json;
};

export interface AppUsage extends Model<Types.IAppUsage,{},Types.IAppUsageMethods>,Types.IAppUsageStatics {}
const AppUsage:AppUsage = mongoose.model<Types.IAppUsage,AppUsage>('cctx_app_usage',appUsageSchema);
export default AppUsage;