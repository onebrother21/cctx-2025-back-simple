import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import DegenTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = DegenTypes.IDegenVenueStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const venueSchema = new Schema<DegenTypes.IDegenVenue,DegenVenue,DegenTypes.IDegenVenueMethods>({
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  status:{type:String,enum:Object.values(DegenTypes.IDegenVenueStatuses),default:NEW},
  type:{type:String,enum:["home","bar","poker","other"]},
  name:{type:String,required:true},
  addr:Utils.addrSchema,
  phn:String,
  host:String,
  org:String,
  desc:String,
  img:Object,
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn"}});

venueSchema.plugin(uniqueValidator);
venueSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
venueSchema.methods.populateMe = async function () {await this.populate("creator");};
venueSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
    name:this.name,
    img:this.img?.url,
    addr:this.addr.info as any,
  };
};
venueSchema.methods.json = function () {
  const json:Partial<DegenTypes.IDegenVenueOTO> = {};
  json.id = this._id.toString();
  json.creator = (this.creator as any).preview();
  json.createdOn = this.createdOn;
  json.name = this.name;
  json.type = this.type;
  json.addr = {info:this.addr.info,loc:(this.addr.loc as any).cooridnates};
  json.phn = this.phn;
  json.desc = this.desc;
  json.host = this.host;
  json.org = this.org;
  json.img = this.img?.url || "";
  json.info = this.info;
  json.meta = this.meta;
  json.status = this.status;
  json.publishedOn = this.createdOn;
  return json as any;
};

type DegenVenue = Model<DegenTypes.IDegenVenue,{},DegenTypes.IDegenVenueMethods>;
const DegenVenue:DegenVenue = mongoose.model<DegenTypes.IDegenVenue>('degen_poker_venues',venueSchema);
export default DegenVenue;