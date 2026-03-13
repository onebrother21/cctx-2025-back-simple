import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Utils from '@utils';
import Types from "@types";
import PingTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PingTypes.IPingPosStatuses;

const posSchema = new Schema<PingTypes.IPingPos,PingPos,PingTypes.IPingPosMethods>({
  status:{type:String,enum:Object.values(PingTypes.IPingPosStatuses),default:NEW},
  owner:{type:ObjectId,ref:"cctx_profiles",required:true},
  posId:Number,
  pin:String,
  addr:Utils.addressSchema,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

posSchema.plugin(uniqueValidator);
posSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
posSchema.methods.populateMe = async function () {
  await this.populate("owner");
};
posSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
posSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    owner:this.owner.preview() as any,
    posId:this.posId,
    addr:this.addr,
    info:this.info,
    meta:this.meta,
  };
};

type PingPos = Model<PingTypes.IPingPos,{},PingTypes.IPingPosMethods>;
const PingPos:PingPos = mongoose.model<PingTypes.IPingPos>('ping_pos',posSchema);
export default PingPos;