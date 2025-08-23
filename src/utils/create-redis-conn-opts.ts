import { QueueOptions } from 'bullmq';
import { URL } from "url";

export const getRedisConnectionOpts = () => {
  let connection:QueueOptions["connection"];
  if(process.env.REDIS_LIVE_URL && /production|staging|live-redis/.test(process.env.NODE_ENV)){
    // Parse Redis URL for production environments
    const redisUrl = new URL(process.env.REDIS_LIVE_URL);
    connection = {
      host: redisUrl.hostname,
      port: Number(redisUrl.port),
      password: redisUrl.password,
      tls: process.env.REDIS_TLS === "true" ? {} : undefined, // TLS for secure connections
    };
  }
  else {
    console.log("chceking in")
    // Local Redis configuration
    connection = {
      //lazyConnect: true,
      //keepAlive: 1000,
      //connectTimeout:10000,
      host: process.env.REDIS_HOST_ZERO || process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      //username: process.env.REDIS_USER,
      //password: process.env.REDIS_PASSWORD,
      //tls: process.env.REDIS_TLS === "true" ? {} : { rejectUnauthorized: false },
    };
  }
  return connection;
}