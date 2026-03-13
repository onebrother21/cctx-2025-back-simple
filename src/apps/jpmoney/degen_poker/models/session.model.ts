import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Utils from '@utils';
import Types from "@types";
import DegenTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = DegenTypes.IDegenSessionStatuses;

const legderItemSchema = new Schema<DegenTypes.IDegenSession["ledger"]>({
  time:Date,
  amt:Number,
  reason:String
},{timestamps:false,_id:false});

const sessionSchema = new Schema<DegenTypes.IDegenSession,DegenSession,DegenTypes.IDegenSessionMethods>({
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  status:{type:String,enum:Object.values(DegenTypes.IDegenSessionStatuses),default:NEW},
  venue:{type:ObjectId,ref:"degen_poker_venues",required:true},
  type:{type:String,enum:["C","T"]},
  desc:String,
  dateOfPlay:Date,
  startTime:String,
  endTime:String,
  ledger:[legderItemSchema],
  notes:[Utils.noteSchema],
  hands:[Object],
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

sessionSchema.plugin(uniqueValidator);
sessionSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
sessionSchema.methods.populateMe = async function () {await this.populate("creator venue notes.author");};
sessionSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
sessionSchema.methods.json = function () {
  const json:DegenTypes.IDegenSessionOTO = {};
  json.id = this._id.toString();
  json.creator = this.creator.preview() as any;
  json.createdOn = this.createdOn;
  json.updatedOn = this.updatedOn;
  json.venue = this.venue.preview() as any;
  json.type = this.type;
  json.desc = this.desc;
  json.dateOfPlay = this.dateOfPlay;
  json.startTime = this.startTime;
  json.endTime = this.endTime;
  json.ledger = this.ledger;
  json.hands = this.hands;
  json.notes = this.notes.slice(-20).map(n => ({
    author:n.author.preview() as any,
    body:n.body,
    time:n.time,
  }) as any);
  json.status = this.status;
  json.info = this.info;
  json.meta = this.meta;
  json.player = json.creator;
  return json;
};

type DegenSession = Model<DegenTypes.IDegenSession,{},DegenTypes.IDegenSessionMethods>;
const DegenSession:DegenSession = mongoose.model<DegenTypes.IDegenSession>('degen_poker_sessions',sessionSchema);
export default DegenSession;