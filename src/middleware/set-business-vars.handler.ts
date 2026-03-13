import RedisCache from "../init-cache";

export const SetBusinessVars:(cache:RedisCache) => IHandler = cache => async (req, res, next) => {
  try{
    const bvars = await cache.get();
    if(!bvars) throw "App cache not configured!";
    req.bvars = bvars;
    next();
  }
  catch(e){next(e);}
};
export default SetBusinessVars;