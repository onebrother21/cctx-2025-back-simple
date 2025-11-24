import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import UTypes from "../types";
import Utils from '../../../utils';
import Models from '../../../models';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = UTypes.IBugStatuses;

const bugMetaSchema = new Schema<UTypes.IBug["meta"]>({
  assigned:Date,
  completed:Date,
  cancelled:Date,
  rejected:Date,
  reopened:Date,
},{_id:false,timestamps:false});
const bugSchema = new Schema<UTypes.IBug,Bug,UTypes.IBugMethods>({
  log:{type:[{type:ObjectId,ref:"upcentric_activity"}],default:() => []},
  project: { type: String,required:true},
  title: { type: String,required:true},
  execAction: { type: String,required:true},
  lob: { type: String,required:true},
  desc:String,
  recurring:{type:Boolean},
  recurringInterval:{type:String,enum:["wk","2wk","3wk","mo","3mo","6mo","yr"]},
  amt:{type:Number},
  startOn:{type:Date,required:true},
  dueOn:{type:Date,required:true},
  priority:{type:Number,min:1,max:4,default:() => 4},
  progress:{type:Number,min:0,max:100,default:() => 0},
  resolution:String,
  reason:{ type: String},
  assignees:String,
  creator:{type:ObjectId,ref:"upcentric_profiles",required:true},
  admin:{type:ObjectId,ref:"upcentric_profiles"},
  tasks:[{type:ObjectId,ref:"upcentric_tasks"}],
  files:[Utils.attachmentSchema],
  info:{type:Object},
  meta:bugMetaSchema,
},{timestamps:{createdAt:"createdOn"}});

bugSchema.plugin(uniqueValidator);
bugSchema.virtual('status').get(function () {
  const log = this.log as AppActivityUpdate[];
  const idx = Utils.findReverseIndex(log,o => !!o.status);
  return log[idx].status;
});
bugSchema.methods.saveMe = async function (o){
  if(o) {
    const n = await Models.AppActivity.create(o);
    this.log.push(n._id as any);
  }
  await this.save();
  await this.populateMe();
};
bugSchema.methods.populateMe = async function () {
  await this.populate("creator log");
};
bugSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
    project:this.project,
    title:this.title,
    desc:this.desc,
    status:this.status,
  };
};
bugSchema.methods.json = function () {
  const json:Partial<UTypes.IBugOTO> = {};
  json.id = this._id.toString();
  json.creator = (this.creator as any).preview();
  json.createdOn = this.createdOn;
  json.project = this.project;
  json.title = this.title;
  json.lob = this.lob;
  json.execAction = this.execAction;
  json.desc = this.desc;
  json.recurring = this.recurring;
  json.recurringInterval = this.recurringInterval;
  json.amt = this.amt;
  json.tasks = this.tasks.map(o => o.preview()).slice(-20);
  json.notes = this.log.filter((o:any) => !!o.msg).slice(-20);
  json.status = this.status;
  json.startOn = this.startOn;
  json.dueOn = this.dueOn;
  json.priority = this.priority;
  json.progress = this.progress;
  json.assignees = this.assignees;
  json.admin = this.admin?this.admin.preview() as any:null;
  json.resolution = this.resolution;
  json.reason = this.reason;
  json.info = this.info;
  json.meta = this.meta;
  return json as any;
};

type Bug = Model<UTypes.IBug,{},UTypes.IBugMethods>;
const Bug:Bug = mongoose.model<UTypes.IBug>('upcentric_bugs',bugSchema);
export default Bug;