import mongoose,{Schema,Model} from 'mongoose';
import Types from "@types";
import Utils from '@utils';

const ObjectId = Schema.Types.ObjectId;
const {NEW} = Types.IMessageStatuses;
const messageStatuses = Object.values(Types.IMessageStatuses);
const uniqueValidator = require("mongoose-unique-validator").default;

const messageReactionSchema = new Schema<Types.IReaction>({
  type:{type: String,enum:Object.values(Types.IReactions)},
  user:{type:ObjectId,required:true,ref:"cctx_profiles"},
},{timestamps:{createdAt:"time"},_id:false});
const messageSchema = new Schema<Types.IMessage,Message,Types.IMessageMethods>({
  author:{type:ObjectId,required:true,ref:"cctx_profiles"},
  status:{type: String,enum:messageStatuses,default:NEW},
  app:String,
  type:String,
  body:String,
  title:String,
  subject:String,
  sender:String,
  recipient:String,
  reactions:[messageReactionSchema],
  replies:[{type:ObjectId,required:true,ref:"cctx_messages"}],
  meta:Object,
},{timestamps:{createdAt:"time"}});

messageSchema.plugin(uniqueValidator);
messageSchema.index({location:"2dsphere"});
messageSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
messageSchema.methods.populateMe = async function () {
  await this.populate("author reactions.user replies replies.author");
}

messageSchema.methods.preview = function (){
  return {
    id:this.id,
    app:this.app,
    type:this.type,
  };
};
messageSchema.methods.json = function () {
  const json:Types.IMessageJson =  {...this.preview() as any};
  json.status = this.status;
  json.body = this.body;
  json.time = this.time;
  json.meta = {...this.meta};
  json.author = this.author.preview() as any;
  switch(this.type){
    case "post":{
      json.title = this.title;
      json.replies = this.replies.map(c => c.json() as any);
      json.reactions = this.reactions.map(o => ({...o,user:o.user.preview() as any}));
      json.meta.replyCt = this.replies.length;
      json.meta.reactionCt = this.reactions.length;
      break;
    }
    case "comment":{
      json.replies = this.replies.map(c => c.json() as any);
      json.reactions = this.reactions.map(o => ({...o,user:o.user.preview() as any}));
      json.meta.replyCt = this.replies.length;
      json.meta.reactionCt = this.reactions.length;
      break;
    }
    case "inbox":{
      json.sender = this.sender;
      json.recipient= this.recipient;
      json.subject = this.subject;
      json.replies = this.replies.map(c => c.json() as any);
      json.meta.replyCt = this.replies.length;
      break;
    }
    case "live":{
      json.reactions = this.reactions.map(o => ({...o,user:o.user.preview() as any}));
      json.meta.reactionCt = this.reactions.length;
      break;
    }
    case "note":{
      break;
    }
  }
  return json;
};
type Message = Model<Types.IMessage,{},Types.IMessageMethods>;
const Message:Message = mongoose.model<Types.IMessage>('cctx_messages',messageSchema);
export default Message;