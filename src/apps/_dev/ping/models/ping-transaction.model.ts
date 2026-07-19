import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PingTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PingTypes.IPingTransactionStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const transactionSchema = new Schema<PingTypes.IPingTransaction,PingTransaction,PingTypes.IPingTransactionMethods>({
  status:{type:String,enum:Object.values(PingTypes.IPingTransactionStatuses),default:NEW},
  payer:String,
  payee:String,
  amount:Number,
  currency:String,
  timestamp:Date,
  txId:String,
  type:{type:String,enum:["payment","init"],default:"payment"},
  info:Object,
  meta:Object,
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

transactionSchema.plugin(uniqueValidator);
transactionSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
transactionSchema.methods.populateMe = async function () {
  //await this.populate(".author");
};
transactionSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
transactionSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    createdOn:this.createdOn,
    payer:this.payer,
    payee:this.payee,
    amount:this.amount,
    currency:this.currency,
    timestamp:this.timestamp,
    txId:this.txId,
    type:this.type,
    info:this.info,
    meta:this.meta,
  };
};

type PingTransaction = Model<PingTypes.IPingTransaction,{},PingTypes.IPingTransactionMethods>;
const PingTransaction:PingTransaction = mongoose.model<PingTypes.IPingTransaction>('ping_trasactions',transactionSchema);
export default PingTransaction;