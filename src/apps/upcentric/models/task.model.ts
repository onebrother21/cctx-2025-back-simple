import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import Types from "../types";
import Utils from '../../../utils';
import Models from '../../../models';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.ITaskStatuses;

const taskMetaSchema = new Schema<Types.ITask["meta"]>({
  assigned:Date,
  completed:Date,
  cancelled:Date,
  rejected:Date,
  reopened:Date,
},{_id:false,timestamps:false});
const taskSchema = new Schema<Types.ITask,Task,Types.ITaskMethods>({
  log:{type:[{type:ObjectId,ref:"upcentric_activity"}],default:() => []},
  creator:{type:ObjectId,ref:"upcentric_profiles",required:true},
  project: { type: String,required:true},
  title: { type: String,required:true},
  execAction: { type: String,required:true},
  lob: { type: String,required:true},
  desc:String,
  startOn:{type:Date,required:true},
  dueOn:{type:Date,required:true},
  priority:{type:Number,min:1,max:4,default:() => 4},
  progress:{type:Number,min:0,max:100,default:() => 0},
  resolution:String,
  reason:String,
  recurring:Boolean,
  recurringInterval:{type:String,enum:["wk","2wk","3wk","mo","3mo","6mo","yr"]},
  amt:Number,
  tasks:[{type:ObjectId,ref:"upcentric_tasks"}],
  files:[Utils.attachmentSchema],
  info:Object,
  meta:taskMetaSchema,
  assignees:String,
  admin:{type:ObjectId,ref:"upcentric_profiles"},
},{timestamps:{createdAt:"createdOn"}});

taskSchema.plugin(uniqueValidator);
taskSchema.virtual('status').get(function () {
  const log = this.log as AppActivityUpdate[];
  const idx = Utils.findReverseIndex(log,o => !!o.status);
  return log[idx].status;
});
taskSchema.methods.saveMe = async function (o){
  if(o) {
    const n = await Models.AppActivity.create(o);
    this.log.push(n._id as any);
  }
  await this.save();
  await this.populateMe();
};
taskSchema.methods.populateMe = async function () {
  await this.populate("creator log");
};
taskSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
    project:this.project,
    title:this.title,
    desc:this.desc,
    status:this.status,
    priority:this.priority,
  };
};
taskSchema.methods.json = function () {
  const json:Partial<Types.ITaskOTO> = {};
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
  json.tasks = this.tasks.map(o => o.preview() as Types.ITask);
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

type Task = Model<Types.ITask,{},Types.ITaskMethods>;
const Task:Task = mongoose.model<Types.ITask>('upcentric_tasks',taskSchema);
export default Task;