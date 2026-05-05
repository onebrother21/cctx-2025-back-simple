import mongoose,{Schema,Model} from 'mongoose';
import Types from "@types";
import Utils from '@utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.IMsgChainStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const msgChainSchema = new Schema<Types.IMsgChain,MsgChain,Types.IMsgChainMethods>({
  creator:{type:ObjectId,required:true,ref:"cctx_profiles"},
  users:[{type:ObjectId,required:true,ref:"cctx_profiles"}],
  msgs:[{type:ObjectId,required:true,ref:"cctx_messages"}],
  status:{type: String,enum:Object.values(Types.IMsgChainStatuses),default:NEW},
  app:{type: String,lowercase: true ,required:true},
  type:{type: String,enum:["channel","post"]},
  info:Object,
  meta:Object,
  img:Object,
  name:String,
  desc:String,
},{timestamps:{createdAt:"createdOn"}});
 
msgChainSchema.plugin(uniqueValidator);
msgChainSchema.index({location:"2dsphere"});
msgChainSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
msgChainSchema.methods.populateMe = async function () {
  await this.populate("creator users msgs msgs.author");
}

msgChainSchema.methods.preview = function (){
  return {
    id:this.id,
    userCt:this.users.length,
    name:this.name,
    app:this.app,
    type:this.type,
    img:this.img?.url || "",
  };
};
msgChainSchema.methods.json = function () {
  const json:Types.IMsgChainJson =  {...this.preview() as any};
  json.creator = (this.creator as any).preview();
  json.status = this.status;
  json.msgs = this.msgs.map(c => c.json() as any);
  json.users = this.users.map(c => c.preview() as any);
  json.userCt = this.users.length;
  json.name = this.name;
  json.app = this.app;
  json.type = this.type;
  json.desc = this.desc;
  json.img = this.img?.url || "";
  json.createdOn = this.createdOn;
  return json;
};
type MsgChain = Model<Types.IMsgChain,{},Types.IMsgChainMethods>;
const MsgChain:MsgChain = mongoose.model<Types.IMsgChain>('cctx_msg_chains',msgChainSchema);
export default MsgChain;