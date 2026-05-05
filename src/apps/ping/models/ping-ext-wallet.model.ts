import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PingTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PingTypes.IPingExtWalletStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const walletSchema = new Schema<PingTypes.IPingExtWallet,PingExtWallet,PingTypes.IPingExtWalletMethods>({
  status:{type:String,enum:Object.values(PingTypes.IPingExtWalletStatuses),default:NEW},
  owner:{type:ObjectId,ref:"cctx_profiles",required:true},
  walletId:{type:Number,required:true},
  name:String,
  type:String,
  platform:String,
  addr:String,
  balances:Object,
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

walletSchema.plugin(uniqueValidator);
walletSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
walletSchema.methods.populateMe = async function () {
  await this.populate("owner");
};
walletSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
walletSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    owner:this.owner.preview() as any,
    name:this.name,
    platform:this.platform,
    addr:this.addr,
    type:this.type,
    info:this.info,
    meta:this.meta,
  };
};

type PingExtWallet = Model<PingTypes.IPingExtWallet,{},PingTypes.IPingExtWalletMethods>;
const PingExtWallet:PingExtWallet = mongoose.model<PingTypes.IPingExtWallet>('ping_ext_wallets',walletSchema);
export default PingExtWallet;