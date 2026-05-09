import * as Utils from './common-utils';
import * as logger from './console-logger';
import { QueueOptions } from 'bullmq';
import { URL } from "url";

const {
  NODE_ENV,
  REDIS_LIVE_URL,
  REDIS_HOST,
  REDIS_HOST_ZERO,
  REDIS_PORT,
  REDIS_TLS,
  REDIS_USER,
  REDIS_PASSWORD,
} = process.env;

export const getRedisConnectionOpts = () => {
  let connection:QueueOptions["connection"] = {
    lazyConnect: true,
    keepAlive: 1000,
    connectTimeout:10000,
    maxRetriesPerRequest:6,
  }
  logger.info("redis-conn-opts",{REDIS_LIVE_URL,isProd:Utils.isProd()});
  if(Utils.isProd() && REDIS_LIVE_URL){
    const redisUrl = new URL(REDIS_LIVE_URL);
    connection.host = redisUrl.hostname;
    connection.port = Number(redisUrl.port);
    connection.password = redisUrl.password;
    connection.tls = REDIS_TLS === "true" ? {} : undefined; // TLS for secure connections
  }
  else {
    connection.host = REDIS_HOST_ZERO || REDIS_HOST || "localhost";
    connection.port = Number(REDIS_PORT) || 6379;
    //connection.username = REDIS_USER;
    //connection.password = REDIS_PASSWORD;
    //connection.tls = REDIS_TLS === "true" ? {} : { rejectUnauthorized: false };
  }
  return connection;
}