import { Queue,QueueOptions } from 'bullmq';
import { getRedisConnectionOpts } from './create-redis-conn-opts';
import * as logger from './console-logger';

const getBullQueueOpts = () => {
  const opts:QueueOptions = {
    connection:getRedisConnectionOpts(),
    skipVersionCheck:true,
    defaultJobOptions:{
      removeOnComplete: {
        //age: 3600, // keep up to 1 hour
        count: 10, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
      },
    },
  };
  return opts;
}
export const createQueue = (name:string,options?:any) => {
    const opts = getBullQueueOpts();
    const queue = new Queue(name,opts);
    if(options && options.logItems && options.logItems.length){
      if(options.logItems.includes('error')) queue.on('error',info => logger.print("debug",`${name}-queue`,'Error -> ',info));
      if(options.logItems.includes('closed')) queue.on("ioredis:close",() => logger.print("debug",`${name}-queue`,'IORedis Closed -> '));
      if(options.logItems.includes('resumed')) queue.on("resumed",() => logger.print("debug",`${name}-queue`,'Resumed -> '))
      if(options.logItems.includes('cleaned')) queue.on("cleaned",info => logger.print("debug",`${name}-queue`,'Cleaned -> ',info))
      if(options.logItems.includes('progress')) queue.on("progress",info => logger.print("debug",`${name}-queue`,'Progess -> ',info))
      if(options.logItems.includes('waiting')) queue.on('waiting',info => logger.print("debug",`${name}-queue`,'Waiting -> ',info))
      if(options.logItems.includes('removed')) queue.on('removed',info => logger.print("debug",`${name}-queue`,'Removed -> ',info));
      if(options.logItems.includes("init")) logger.print("debug",`${name}-queue`,'Initialized');
  }
  return queue;
}
export default createQueue;