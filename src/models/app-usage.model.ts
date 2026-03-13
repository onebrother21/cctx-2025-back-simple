import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "@types";
import Utils from '@utils';

const appUsageSchema = new Schema<Types.IAppUsage,AppUsage,Types.IAppUsageMethods>({
  status:{type:String,enum:["new"],default:"new"},
  who:{type:String,required:true},
  what:{type:Schema.Types.Mixed,required:true},
  which:String,
  where:Utils.locCoordsSchema,
  when:{type:Date,default:() => Date.now()},
  how:String,
  to:String,
  with:String,
  why:String,
},{timestamps:false});
appUsageSchema.index({"where":"2dsphere"});
appUsageSchema.plugin(uniqueValidator);
appUsageSchema.static("make",async function (
  userOrProfile:"sys-admn"|`${"usr"|"adm"|"prf"}/${string}`,
  action:string|number,
  dataObj?:Partial<Types.IAppUsage & LocationObj & {device:Types.IAppDevice}>,
){
  const {loc,device,...data} = dataObj || {};
  const how = device?`${
    (device.os.name?device.os.name + " ":"")+
    (device.browser.name?device.browser.name + " ":"")+
    (device.device.model?device.device.model + " ":"")+
    (device.meta.lastAddr?device.meta.lastAddr + " ":"")
  }`:"";
  const o:any = {
    who:userOrProfile,
    what:action,
    when:new Date(),
    ...loc?{where:{type:"Point",coordinates:loc}}:{},
    ...device?{how}:{},
    ...data,
  };
  const n = new AppUsage(o);
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
const AppUsage:AppUsage = mongoose.model<Types.IAppUsage,AppUsage>('cctx_app_usages',appUsageSchema);
export default AppUsage;