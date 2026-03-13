import { Schema } from 'mongoose';
import { stateAbbreviations, streetAddrRegex } from './constants';
import Types from "@types";

const ObjectId = Schema.Types.ObjectId;

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

const locCoordsSchema = new Schema({type:String,coordinates:[Number]},{timestamps:false,_id:false});
const addressSchema = new Schema<AddressObj>({
  streetAddr: { type: String,required:true,validate:streetAddrRegex},
  city: { type: String,required:true},
  state: { type: String,required:true,enum:[...stateAbbreviations]},
  postal: { type: String},
  country: { type: String,required:true},
  info:{type:String},
  loc:locCoordsSchema,//{type:locCoordsSchema,validate:(loc:number[]) => ({type:"Point",coordinates:loc})}
},{_id:false,timestamps:false});
addressSchema.index({"loc":"2dsphere"});
const addrSchema = new Schema<AddressObj>({
  info:{type:String},
  loc:locCoordsSchema,//{type:locCoordsSchema,validate:(loc:number[]) => ({type:"Point",coordinates:loc})}
},{_id:false,timestamps:false});
addrSchema.index({"loc":"2dsphere"});
const noteSchema = new Schema<Types.INote>({
  type:{type:String,default:"note"},
  time:Date,
  body:String,
  author:{type:ObjectId,ref:"cctx_profiles",required:true},
},{_id:false,timestamps:false});

export {
  locCoordsSchema,
  addrSchema,
  addressSchema,
  attachmentSchema,
  uploadSchema,
  noteSchema,
};

