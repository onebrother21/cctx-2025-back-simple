import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "@types";
import Utils from '@utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.ITaskStatuses;

const taskSchema = new Schema<Types.ITask,Task,Types.ITaskMethods>({
  creator:{type:ObjectId,ref:"cctx_profiles",required:true},
  status:{type:String,enum:Object.values(Types.ITaskStatuses),default:NEW},
  app:{type:String,required:true},
  type:{type:String,enum:["bug","improvement","suggestion","other"]},
  title:{type:String,required:true},
  desc:{type:String,required:true},
  notes:[Utils.noteSchema],
  tasks:[{type:ObjectId,ref:"cctx_tasks",required:true}],
  admin:{type:ObjectId,ref:"cctx_profiles"},
  priority:{type:Number,default:4},
  progress:{type:Number,default:0},
  resolution:String,
  reason:String,
  startOn:Date,
  dueOn:Date,
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

taskSchema.plugin(uniqueValidator);
taskSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
taskSchema.methods.populateMe = async function () {await this.populate("creator tasks notes.author");};
taskSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
    app:this.app,
    type:this.type,
    title:this.title,
    desc:this.desc,
  };
};
taskSchema.methods.json = function () {
  const json:Types.ITaskOTO = {...this.preview()};
  json.creator = this.creator.preview() as any;
  json.createdOn = this.createdOn;
  json.updatedOn = this.updatedOn;
  json.priority = this.priority;
  json.progress = this.progress;
  json.resolution = this.resolution;
  json.reason = this.reason;
  json.startOn = this.startOn;
  json.dueOn = this.dueOn;
  json.notes = this.notes.slice(-20).map(n => ({
    author:n.author.preview() as any,
    body:n.body,
    time:n.time,
  }) as any);
  json.tasks = this.tasks.map(t => t.preview() as any);
  json.status = this.status;
  json.info = this.info;
  json.meta = this.meta;
  return json;
};

type Task = Model<Types.ITask,{},Types.ITaskMethods>;
const Task:Task = mongoose.model<Types.ITask>('cctx_tasks',taskSchema);
export default Task;