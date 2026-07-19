import * as Utils from './common-utils';
import { QueueOptions } from 'bullmq';
import { URL } from "url";

const redis_live_url = Utils.getVar("REDIS_LIVE_URL"),
redis_host = Utils.getVar("REDIS_HOST"),
redis_host_zero = Utils.getVar("REDIS_HOST_ZERO"),
redis_port = Utils.getVar("REDIS_PORT"),
redis_tls = Utils.getVar("REDIS_TLS"),
redis_user = Utils.getVar("REDIS_USER"),
redis_pswd = Utils.getVar("REDIS_PASSWORD");

export const getRedisConnectionOpts = () => {
  const connection:QueueOptions["connection"] = {
    lazyConnect: true,
    keepAlive: 1000,
    connectTimeout:10000,
    //maxRetriesPerRequest:6,
  }
  if(Utils.isProd() && redis_live_url){
    const redisUrl = new URL(redis_live_url);
    connection.host = redisUrl.hostname;
    connection.port = Number(redisUrl.port);
    connection.password = redisUrl.password;
    connection.tls = redis_tls === "true" ? {} : undefined; // TLS for secure connections
  }
  else {
    connection.host = redis_host_zero || redis_host || "localhost";
    connection.port = Number(redis_port) || 6379;
    //connection.username = redis_user;
    //connection.password = redis_pswd;
    //connection.tls = redis_tls === "true" ? {} : { rejectUnauthorized: false };
  }
  return connection;
}