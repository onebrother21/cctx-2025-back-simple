import { Schema } from 'mongoose';
import { stateAbbreviations } from './constants';
import Types from "../types";

const noteSchema = new Schema({
  user: { type: String},
  msg: { type: String},
  time:{type:Date}
},{_id:false,timestamps:false});
const attachmentSchema = new Schema<Attachment>({
  originDate:{type:Date},
  originLoc:{type:String},
  originName:{type:String},
  mimeType:{type:String,enum:["pdf","doc","docx","png","jpg","jpeg","aud","wav","mov4"]},
  size:{type:Number},
  res:{type:String},
  location:{type:String},
},{_id:false,timestamps:false});

const uploadSchema = new Schema<UploadResponse>({
  type:String,
  original_filename: String,
  original_date: Date,
  location:String,
  description:String,
  format: String,
  resource_type: String,
  bytes: Number,
  secure_url: String,
  public_id: String,
  created_at: Date
},{_id:false,timestamps:false});

const streetAddrRegex = /^[\d\w]+\s[\w\s\d,\.]+$/;
const addressSchema = new Schema<AddressObj>({
  streetAddr: { type: String,required:true,validate:streetAddrRegex},
  city: { type: String,required:true},
  state: { type: String,required:true,enum:[...stateAbbreviations]},
  postal: { type: String},
  country: { type: String,required:true},
  info:{type:String},
  loc:{type:{type:String,default:"Point"},coordinates:[Number]},
},{_id:false,timestamps:false});
addressSchema.index({"loc":"2dsphere"});
const statusSchema = new Schema({
  name: { type: String,required:true},
  time: { type: Date,default:() => Date.now()},
  info: { type: Object},
},{_id:false,timestamps:false});
const getStatusSchema = <K extends string>(statuses:K[],defaultVal?:K) => {
  return new Schema({
    name: { type: String,enum:statuses,default:defaultVal || statuses[0]},
    time: { type: Date,default:() => Date.now()},
    info: { type: Object},
  } as any,{_id:false,timestamps:false}) as Schema<Status<K>>;
};
const getStatusArraySchema = <K extends string>(statuses:K[],defaultVal?:K) => {
  return {
    type:[
      new Schema({
        name: { type: String,enum:statuses},
        time: { type: Date,default:() => Date.now()},
        info: { type: Object},
      } as any,{_id:false,timestamps:false}) as Schema<Status<K>>
    ],
    default:() => statuses.length?[{name:defaultVal || statuses[0],time:new Date()}]:[]
  };
};

export {
  noteSchema,
  addressSchema,
  attachmentSchema,
  uploadSchema,
  statusSchema,
  getStatusSchema,
  getStatusArraySchema,
};

