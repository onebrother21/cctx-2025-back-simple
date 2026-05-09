import * as Utils from './common-utils';
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
  let connection:QueueOptions["connection"];
  if(REDIS_LIVE_URL && Utils.isProd()){
    // Parse Redis URL for production environments
    const redisUrl = new URL(REDIS_LIVE_URL);
    connection = {
      host: redisUrl.hostname,
      port: Number(redisUrl.port),
      password: redisUrl.password,
      tls: REDIS_TLS === "true" ? {} : undefined, // TLS for secure connections
    };
  }
  else {
    // Local Redis configuration
    connection = {
      //lazyConnect: true,
      //keepAlive: 1000,
      //connectTimeout:10000,
      host: REDIS_HOST_ZERO || REDIS_HOST || "localhost",
      port: Number(REDIS_PORT) || 6379,
      //username: REDIS_USER,
      //password: REDIS_PASSWORD,
      //tls: REDIS_TLS === "true" ? {} : { rejectUnauthorized: false },
    };
  }
  return connection;
}