import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "@types";

const {NEW} = Types.IAppDeviceStatuses;

const appDeviceSchema = new Schema<Types.IAppDevice,AppDevice,Types.IAppDeviceMethods>({
  status:{type:String,enum:Object.values(Types.IAppDeviceStatuses),default:NEW},
  ua:String,
  mobile:Boolean,
  browser:Object,
  screen:Object,
  device:Object,
  engine:Object,
  os:Object,
  socket:String,
  addrs:[String],
  meta:Object,
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
  json.mobile = this.mobile;
  json.screen = this.screen;
  json.browser = this.browser;
  json.device = this.device;
  json.engine = this.engine;
  json.os = this.os;
  json.socket = this.socket;
  json.meta = this.meta;
  json.info = this.info;
  json.createdOn = this.createdOn;
  //json.updatedOn = this.updatedOn;
  return json;
};

type AppDevice = Model<Types.IAppDevice,{},Types.IAppDeviceMethods>;
const AppDevice:AppDevice = mongoose.model<Types.IAppDevice>('cctx_devices',appDeviceSchema);
export default AppDevice;