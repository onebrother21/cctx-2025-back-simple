import Redis from "ioredis";
import Models from "@models";
import Utils from "@utils";

export interface RedisCache {redis:Redis}
export class RedisCache {
  public get = async () => JSON.parse(await this.redis.get("ccdev-2025-back-new") || "null");
  public set = async (updates:any) => await this.redis.set("ccdev-2025-back-new",JSON.stringify({
    ...await this.get(),
    ...updates,
  }));
  public clear = async () => await this.redis.set("ccdev-2025-back-new","null");

  public save = this.set;

  private load = async () => {
    const bvars = await Models.BusinessVars.findOne({name:"ccdev-2025-back-new",status:"active"});
    const data = bvars.json();
    await this.set(data);
    return data;
  };
  public print = async () => {
    try {
      const cache = await this.get();
      Utils.debug("<redisCache>","AppVars ->",cache);
    }
    catch (e) {
      Utils.error("<redisCache>",e);
    }
  };
  public static connect = async (o:{
    clear?:boolean,
    reload?:boolean,
  } = {}):Promise<RedisCache> => new Promise((done,reject) => {
    const cache = new this();
    cache.redis = new Redis(Utils.getRedisConnectionOpts());
    cache.redis.on("error",e => {
      Utils.error("<redisCache>",e);
      reject(e);
    });
    cache.redis.on("connect",async () => {
      const bvars = o.clear?{}:await cache.get();
      const bvars_ = o.clear || o.reload?await cache.load():{};
      const data = {...bvars,...bvars_};
      await cache.set(data);
      Utils.ok("redis-cache","Connected");
      done(cache);
    });
  });
}
export default RedisCache;
  
  
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