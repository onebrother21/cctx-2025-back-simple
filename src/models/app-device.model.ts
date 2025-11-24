import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "../types";

const {NEW} = Types.IAppDeviceStatuses;

const appDeviceSchema = new Schema<Types.IAppDevice,AppDevice,Types.IAppDeviceMethods>({
  status:{type: String,enum:Object.values(Types.IAppDeviceStatuses),default:NEW},
  mobile:Boolean,
  height:Number,
  width:Number,
  device:Object,
  browser:Object,
  engine:Object,
  os:Object,
  ua:String,
  socket:String,
  addrs:[String],
  lastUse:Date,
  lastAddr:String,
  meta:Schema.Types.Mixed,
  info:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
appDeviceSchema.plugin(uniqueValidator);
appDeviceSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
appDeviceSchema.methods.populateMe = async function () {};
appDeviceSchema.methods.json = function () {
  const json:Partial<Types.IAppDevice> =  {};
  json.id = this.id;
  json.status = this.status;
  json.ua = this.ua;
  json.browser = this.browser;
  json.device = this.device;
  json.mobile = this.mobile;
  json.height = this.height;
  json.width = this.width;
  json.os = this.os;
  json.engine = this.engine;
  json.socket = this.socket;
  json.meta = this.meta;
  json.info = this.info;
  json.createdOn = this.createdOn;
  json.lastUse = this.lastUse;
  json.lastAddr = this.lastAddr;
  //json.updatedOn = this.updatedOn;
  return json;
};

type AppDevice = Model<Types.IAppDevice,{},Types.IAppDeviceMethods>;
const AppDevice:AppDevice = mongoose.model<Types.IAppDevice>('cctx_devices',appDeviceSchema);
export default AppDevice;