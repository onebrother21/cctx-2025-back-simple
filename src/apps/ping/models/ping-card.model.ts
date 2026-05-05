import mongoose,{Schema,Model} from 'mongoose';
import Utils from '@utils';
import Types from "@types";
import PingTypes from "../types";

const ObjectId = Schema.Types.ObjectId;
const {NEW} = PingTypes.IPingCardStatuses;
const uniqueValidator = require("mongoose-unique-validator").default;

const cardSchema = new Schema<PingTypes.IPingCard,PingCard,PingTypes.IPingCardMethods>({
  status:{type:String,enum:Object.values(PingTypes.IPingCardStatuses),default:NEW},
  owner:{type:ObjectId,ref:"cctx_profiles",required:true},
  cardId:{type:Number,required:true},
  cardNo:{type:String,required:true},
  expiry:{type:String,required:true},
  cvv:{type:String,required:true},
  info:Object,
  meta:Object,
  //links:[String],
},{timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});

cardSchema.plugin(uniqueValidator);
cardSchema.methods.saveMe = async function (){
  await this.save();
  await this.populateMe();
};
cardSchema.methods.populateMe = async function () {await this.populate("owner");};
cardSchema.methods.preview = function () {
  return {
    id:this._id.toString(),
  };
};
cardSchema.methods.json = function () {
  return {
    id:this.id,
    desc:this.desc,
    status:this.status,
    owner:this.owner.preview() as any,
    cardId:this.cardId,
    cardNo:this.cardNo,
    expiry:this.expiry,
    cvv:this.cvv,
    info:this.info,
    meta:this.meta,
  };
};

type PingCard = Model<PingTypes.IPingCard,{},PingTypes.IPingCardMethods>;
const PingCard:PingCard = mongoose.model<PingTypes.IPingCard>('ping_cards',cardSchema);
export default PingCard;