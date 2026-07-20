import mongoose,{Schema,Model} from 'mongoose';
import Types from "@types";
import Utils from "@utils";

const supersecret = Utils.getVar("BVARS_SECRET")||"supersecret";
const {NEW} = Types.IBusinessVarsStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const bvarsSchema = new Schema<Types.IBusinessVars,BusinessVars,Types.IBusinessVars>({
  status:{type:String,enum:Object.values(Types.IBusinessVarsStatuses),default:NEW},
  name:{type:String,unique:true,required:true},
  data:Schema.Types.Mixed,
  meta:Object,
  info:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
bvarsSchema.plugin(uniqueValidator);
bvarsSchema.methods.saveMe = async function (){
  this.data = typeof this.data == "object"?Utils.encrypt(this.data,supersecret):this.data;
  await this.save();
  await this.populateMe();
};
bvarsSchema.methods.updateMe = async function (updates) {
  const data_ = typeof this.data == "string"?Utils.decrypt(this.data,supersecret):this.data;
  if(updates.origins && updates.origins.length) for(const k of updates.origins){
    if(!data_.origins.includes(k)) data_.origins.push(...updates.origins);
    delete updates.origins;
  }
  const data = {...data_,...updates};
  // Utils.trace("bvars-updateMe",data);
  this.data = data;
  await this.saveMe();
};
bvarsSchema.methods.populateMe = async function () {};
bvarsSchema.methods.json = function () {
  const json:Partial<Types.IBusinessVarsJson> =  {};
  json.id = this.id;
  json.status = this.status;
  json.name = this.name;
  json.meta = this.meta;
  json.info = this.info;
  json.createdOn = this.createdOn;
  const data = typeof this.data == "string"?Utils.decrypt(this.data,supersecret):this.data;
  Object.assign(json,data);
  return json;
};

type BusinessVars = Model<Types.IBusinessVars,{},Types.IBusinessVars>;
const BusinessVars:BusinessVars = mongoose.model<Types.IBusinessVars>('cctx_bvars',bvarsSchema);
export default BusinessVars;