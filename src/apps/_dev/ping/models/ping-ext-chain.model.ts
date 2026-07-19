import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PingTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PingTypes.IPingExtChainStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const chainSchema = new Schema<PingTypes.IPingExtChain,PingExtChain,PingTypes.IPingExtChainMethods>({
  status:{type:String,enum:Object.values(PingTypes.IPingExtChainStatuses),default:NEW},
  chainId:{type:Number,required:true},
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

chainSchema.plugin(uniqueValidator);
chainSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
chainSchema.methods.populateMe = async function () {
  //await this.populate(".author");
};
chainSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
chainSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    chainId:this.chainId,
    info:this.info,
    meta:this.meta,
  };
};

type PingExtChain = Model<PingTypes.IPingExtChain,{},PingTypes.IPingExtChainMethods>;
const PingExtChain:PingExtChain = mongoose.model<PingTypes.IPingExtChain>('ping_ext_chains',chainSchema);
export default PingExtChain;