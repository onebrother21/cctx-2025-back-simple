import Models from "../models";
import Utils from "../utils";

export const SetBusinessVars:(cache:Utils.RedisCache) => IHandler = cache => async (req, res, next) => {
  try{
    const bvars = await cache.get();
    if(!bvars) throw "Service not configured!";
    req.bvars = bvars;
    next();
  }
  catch(e){next(e);}
};
export default SetBusinessVars;