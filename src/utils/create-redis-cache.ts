import Redis from "ioredis";
import { getRedisConnectionOpts } from "./create-redis-conn-opts";

import BusinessVars from "../models/bvars.model";
import * as logger from './console-logger';

export class RedisCache {
  redis: Redis;
  public load = async () => {
    const cacheData = await this.get();
    const bvars = await BusinessVars.findOne({status:"active"});
    const data = bvars.json();
    await this.set(data);
    return data;
  }
  public get = async () => JSON.parse(await this.redis.get("app_data") || "null");
  public set = async (updates:any) => await this.redis.set("app_data",JSON.stringify({...await this.get(),...updates}));
  
  public save = this.set;
  public clear = async () => await this.redis.set("app_data","null");
  public connect = async (o?:{clear?:boolean}) => {
    try {
      return new Promise((done,reject) => {
        this.redis = new Redis(getRedisConnectionOpts());
        this.redis.on("error",e => {
          logger.error(e);
          process.exit(1);
        });
        this.redis.on("connect",async () => {
          const o = await this.load();
          logger.print("ok","redis","App cache connected");
          done(true);
        });
      });
    }
    catch (e) {
      logger.error(`Redis connection error. ${e}`);
      process.exit(1);
    }
  };
  public test = async () => {
    try {
      const cache = await this.get();
      logger.print("debug","redisCache","AppVars ->",cache.id);
    }
    catch (e) {
      console.error(e);
    }
  };
  
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
}
export const getRedisCache = async () => {
  const cache = new RedisCache();
  await cache.connect();
  return cache;
}
export default getRedisCache;