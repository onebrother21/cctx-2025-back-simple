import Models from "@models";
import Utils from "@utils";
import { RedisCache } from "../init-cache";
import { ServerOptions } from "socket.io";

const whitelist = JSON.parse(process.env.ORIGINS||"[]");

export const ConfigureCorsSocketIo = (cache:RedisCache):Partial<ServerOptions> => ({
  cors:{
    methods:["GET","POST"],
    credentials:true,
    origin:async (origin:string|undefined,callback:Function) => {
      //Utils.print("debug","cctx-dev-back-sockets",{origin})
      const svars = await cache.get("cctx-dev-back");
      const wl = svars && svars["origins"]?svars["origins"]:whitelist;
      if (!origin || wl.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  },
  allowRequest: async (req, callback:Function) => {
    const svars = await cache.get("cctx-dev-back");
    const origin = req.headers.origin;
    const ip_ = req.socket.localAddress;
    const ip = (ip_ || "").replace(/:/gi,"").replace(/f/gi,"");
    const wl = svars && svars["origins"]?svars["origins"]:whitelist;
    const bl = svars && svars["blacklist"]?svars["blacklist"]:[];
    const isBypass = !origin || wl.includes(origin);
    const inTheClear = ip && !bl.includes(ip);
    switch(true){
      case isBypass && inTheClear:return callback(null,true);
      default:{
        const e = new Utils.AppError(403,"Request not allowed");
        return callback(e.message,false);
      }
    }
  }
});
export default ConfigureCorsSocketIo;