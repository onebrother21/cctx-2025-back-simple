import { RedisCache } from "../init-cache";

export const SetBusinessVars:(cache:RedisCache) => IHandler = cache => async (req,res,next) => {
  const svars = await cache.get("cctx-dev-back");
  req.svars = svars;

  const clientName = 
  /glass/.test(req.url)?"glass":
  /pi_mia/.test(req.url)?"pi_mia":
  /degen_poker/.test(req.url)?"degen_poker":
  /cctx\/admn/.test(req.url)?"cctx_admn":"";
  const cvars = await cache.get(clientName);
  req.cvars = cvars;

  next();
};
export default SetBusinessVars;