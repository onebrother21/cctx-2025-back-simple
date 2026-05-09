import Redis from "ioredis";
import Models from "@models";
import Utils from "@utils";

export interface RedisCache {redis:Redis}
export class RedisCache {
  get = async () => JSON.parse(await this.redis.get("ccdev-2025-back-new") || "null");
  set = async (updates:any) => await this.redis.set("ccdev-2025-back-new",JSON.stringify({
    ...await this.get(),
    ...updates,
  }));
  clear = async () => await this.redis.set("ccdev-2025-back-new","null");
  save = this.set;
  load = async () => {
    const bvars = await Models.BusinessVars.findOne({name:"ccdev-2025-back-new",status:"active"});
    const data = bvars.json();
    await this.set(data);
    return data;
  };
  print = async () => {
    try {
      const cache = await this.get();
      Utils.debug("redis-cache","AppVars ->",cache);
    }
    catch (e) {
      Utils.error("redis-cache",e);
    }
  };
}
 export const initCache = async (reload = false,clear = false):Promise<RedisCache> => {
  try {
    const cache = new RedisCache();
    cache.redis = new Redis(Utils.getRedisConnectionOpts());
    await cache.redis.connect();
    
    const bvars = clear?{}:await cache.get();
    const bvars_ = reload?await cache.load():{};
    const data = {...bvars,...bvars_};
    await cache.set(data);
    Utils.ok("redis-cache","Connected");
    return cache;
  }
  catch(e:any){
    Utils.error("redis-cache",e);
    throw e;
  }
};
export default initCache;


/*
private static createSysAdmin = async (cache:Utils.RedisCache) => {
  const sysadminuser = new Models.User({
    email:"sysadmin@example.com",
    username:"sysadmin",
    name:{first:"sys",last:"admin"},
    dob:new Date("1/1/1999")
  });
  const sysadmin = new Models.Admin({
    displayName:"sysadmin",
    name:"sys admin",
    user:sysadminuser.id,
  });
  sysadminuser.profiles.admin = sysadmin.id;
    await sysadmin.setApproval(Types.IApprovalStatuses.APRROVED,{hash:"#"},true);
    await sysadminuser.setStatus(Types.IUserStatuses.ACTIVE,null,true);
    await cache.set({master:sysadmin.id})
  };
*/