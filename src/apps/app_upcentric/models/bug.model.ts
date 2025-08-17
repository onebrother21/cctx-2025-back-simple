import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";

import Types from "../types";
import Utils from '../../../utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.IBugStatuses;

const bugSchema = new Schema<Types.IBug,Bug,Types.IBugMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(Types.IBugStatuses),NEW),
  creator:{type:ObjectId,ref:"upcentric_profiles",required:true},
  project: { type: String,required:true},
  title: { type: String,required:true},
  execAction: { type: String,required:true},
  lob: { type: String,required:true},
  desc: { type: String,maxlength:250 },
  recurring:{type:Boolean},
  recurringInterval:{type:String,enum:["wk","2wk","3wk","mo","3mo","6mo","yr"]},
  amt:{type:Number},
  startOn:{type:Date,required:true},
  dueOn:{type:Date,required:true},
  assignedOn:Date,
  completedOn:Date,
  admin:{type:ObjectId,ref:"upcentric_profiles"},
  progress:{type:Number,min:0,max:100,default:() => 0},
  resolution:{ type: String,maxlength:140},
  reason:{ type: String},
  bugs:[{type:ObjectId,ref:"upcentric_bugs"}],
  notes:[Utils.noteSchema],
  files:[Utils.attachmentSchema],
  info:{type:Object},
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

bugSchema.plugin(uniqueValidator);
bugSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
bugSchema.methods.saveMe = async function (name,info){
  if(name) this.statusUpdates.push({name,time:new Date(),...(info?{info}:{})});
  if(this.statusUpdates.length > 20) this.statusUpdates = this.statusUpdates.slice(-20);
  await this.save();
  await this.populateMe();
};
bugSchema.methods.populateMe = async function () {
  await this.populate("creator admin");
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
  const json:Partial<Types.IBug> =  {};
  json.id = this._id.toString();
  json.creator = (this.creator as any).preview();
  json.createdOn = this.createdOn;
  json.project = this.project;
  json.title = this.title;
  json.execAction = this.execAction;
  json.desc = this.desc;
  json.recurring = this.recurring;
  json.recurringInterval = this.recurringInterval;
  json.amt = this.amt;
  json.bugs = this.bugs.map(o => o.preview() as Types.IBug);
  json.notes = this.notes.slice(-20);
  json.status = this.status;
  json.startOn = this.startOn;
  json.dueOn = this.dueOn;
  json.progress = this.progress;
  json.assignedOn = this.assignedOn;
  json.admin = this.admin?this.admin.json() as any:null;
  json.completedOn = this.completedOn;
  json.resolution = this.resolution;
  json.reason = this.reason;
  json.info = this.info;
  return json as Types.IBug;
};

type Bug = Model<Types.IBug,{},Types.IBugMethods>;
const Bug:Bug = mongoose.model<Types.IBug>('upcentric_bugs',bugSchema);
export default Bug;