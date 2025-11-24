import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import Types from "../types";
import Utils from '../../../../utils';
import Models from '../../../../models';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.IDegenSessionStatuses;

const sessionNoteSChema = new Schema({
  user:{type:ObjectId,ref:"jpmoney_profiles",required:true},
  time:Date,
  msg:String,
},{timestamps:false,_id:false});
const reloadSchema = new Schema({time:Date,amt:Number},{timestamps:false,_id:false});

const sessionSchema = new Schema<Types.IDegenSession,DegenSession,Types.IDegenSessionMethods>({
  creator:{type:ObjectId,ref:"jpmoney_profiles",required:true},
  status:{type:String,enum:Object.values(Types.IDegenSessionStatuses)},
  venue:String,
  host:String,
  desc:String,
  type:{type:String,enum:["cash","tourney"]},
  start:Date,
  end:Date,
  buyin:Number,
  reloads:[reloadSchema],
  payout:Number,
  notes:[sessionNoteSChema],
},{timestamps:{createdAt:"createdOn"}});

sessionSchema.plugin(uniqueValidator);
sessionSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
sessionSchema.methods.populateMe = async function () {await this.populate("creator notes.user");};
sessionSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
sessionSchema.methods.json = function () {
  const json:Partial<Types.IDegenSessionOTO> = {};
  json.id = this._id.toString();
  json.creator = (this.creator as any).preview();
  json.createdOn = this.createdOn;
  json.project = this.project;
  json.venue = this.venue;
  json.host = this.host;
  json.buyin = this.buyin;
  json.reloads = this.reloads;
  json.payout = this.payout;
  json.start = this.start;
  json.end = this.end;
  json.notes = this.notes.slice(-20);
  json.status = this.status;
  return json as any;
};

type DegenSession = Model<Types.IDegenSession,{},Types.IDegenSessionMethods>;
const DegenSession:DegenSession = mongoose.model<Types.IDegenSession>('jpmoney_sessions',sessionSchema);
export default DegenSession;