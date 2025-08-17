import mongoose,{Schema,Model} from 'mongoose';
import Types from "../types";

type BusinessVarsModel = Model<any>;

const bvars = new Schema({},{strict:false,timestamps:{createdAt:"createdOn",updatedAt:"updatedOn"}});
bvars.methods.json = function () {
  const json:any =  {...this.toObject(),id:this.id};
  return json;
};
const BusinessVars = mongoose.model<any,BusinessVarsModel>('cctx_bvars',bvars);
export default BusinessVars;