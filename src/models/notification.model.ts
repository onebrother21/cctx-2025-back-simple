import mongoose,{Schema,Model} from 'mongoose';
import uniqueValidator from "mongoose-unique-validator";
import Types from "../types";
import Utils from '../utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.INotificationStatuses;

const recipientSchema = new Schema<Types.INotification["audience"][0]>({
  user:{type:ObjectId,ref:"users"},
  info:{type:String,required:true}
},{_id:false,timestamps:false});
const notificationSchema = new Schema<Types.INotification,Notification,Types.INotificationMethods>({
  statusUpdates:Utils.getStatusArraySchema(Object.values(Types.INotificationStatuses),NEW),
  type: {type: String,enum:Object.keys(Types.INotificationTemplates),required: true},
  audience:{
    type:[recipientSchema],
    validate: {
      validator: function (val) {return Array.isArray(val) && val.length > 0;},
      message: 'At least one recipient is required.'
    },
    required:true
  },
  method: {type: String,enum: Object.values(Types.IContactMethods),required:true},
  job: { type: String },
  meta: { type: Schema.Types.Mixed },
  retries: { type: Number, default: () => 0 },
  data: { type: Schema.Types.Mixed }, // Store any data for personalization
  info:{type:Object},
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
notificationSchema.plugin(uniqueValidator);
notificationSchema.virtual('status').get(function () {
  return this.statusUpdates[this.statusUpdates.length - 1].name;
});
notificationSchema.methods.setStatus = async function (name,info,save){
  const status = {name,time:new Date(),...(info?{info}:{})};
  this.statusUpdates.push(status);
  if(save) await this.save();
};
notificationSchema.methods.json = function () {
  const json:Partial<Types.INotification> =  {};
  json.id = this.id;
  json.method = this.method;
  json.audience = this.audience;
  json.type = this.type;
  json.status = this.status;
  json.retries = this.retries;
  json.job = this.job;
  json.data = this.data;
  json.meta = this.meta;
  json.info = this.info;
  //json.createdOn = this.createdOn;
  //json.updatedOn = this.updatedOn;
  return json;
};

type Notification = Model<Types.INotification,{},Types.INotificationMethods>;
const Notification:Notification = mongoose.model<Types.INotification>('cctx_notifications',notificationSchema);
export default Notification;