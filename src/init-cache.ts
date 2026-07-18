import Redis from "ioredis";
import Models from "@models";
import Utils from "@utils";

const apps = JSON.parse(process.env.MY_APPS || "[]");

export interface RedisCache {redis:Redis}
export class RedisCache {
  loadOne = async (varsName:string) => {
    const svars1 = await this.get(varsName);
    const svars2 = await Models.BusinessVars.findOne({name:varsName,status:"active"});
    if(svars2){
      svars2.meta = {...svars2.meta,lastUse:new Date()};
      await svars2.saveMe();
      const svars = {...svars1,...svars2.json()};
      await this.set(varsName,svars);
    }
    else Utils.warn(`AppVars (${varsName}) Unavailable")`);
  };
  load = async () => {
    try {for(const k of apps) await this.loadOne(k);}
    catch(e){Utils.error("redis-cache.load",e);throw e;}
  };
  get = async (s:string) => JSON.parse(await this.redis.get(s) || "null");
  set = async (s:string,updates:any) => await this.redis.set(s,JSON.stringify({
    ...await this.get(s),
    ...updates,
  }));
  clear = async (s:string) => await this.redis.set(s,"null");
  save = this.set;
  print = async (s:string) => {
    try {
      const data = await this.get(s);
      Utils.debug("redis-cache",s,data);
    }
    catch (e) {
      Utils.error("redis-cache",e);
    }
  };
}

export const initCache = async ():Promise<RedisCache> => {
  const cache = new RedisCache();
  cache.redis = new Redis(Utils.getRedisConnectionOpts());
  try {
    await cache.redis.connect();
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