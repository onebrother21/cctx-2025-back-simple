import { Worker,Processor,QueueOptions } from 'bullmq';
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
export const createWorker = (name:string,workerFunc:Processor,options?:any) => {
  const opts = getBullQueueOpts();
  const worker = new Worker(name,workerFunc,opts);
  if(options && options.logItems && options.logItems.length){
    if(options.logItems.includes('error')) worker.on('error',info => logger.print("debug",`${name}-worker`,'Error -> ',info))
    if(options.logItems.includes('closed')) worker.on("ioredis:close",() => logger.print("debug",`${name}-worker`,'IORedis Closed -> '))
    if(options.logItems.includes('resumed')) worker.on("resumed",() => logger.print("debug",`${name}-worker`,'Resumed'))
    if(options.logItems.includes('drained')) worker.on("drained",() => logger.print("debug",`${name}-worker`,'Drained -> []'))
    if(options.logItems.includes('progress')) worker.on("progress",info => logger.print("debug",`${name}-worker`,'Progess -> ',info))
    if(options.logItems.includes('completed')) worker.on('completed',info => logger.print("debug",`${name}-worker`,'Completed -> ',info.id))
    if(options.logItems.includes('failed')) worker.on('failed',info => logger.print("debug",`${name}-worker`,'Failed -> ',info?.failedReason || {}));
    if(options.logItems.includes("init")) logger.print("debug",`${name}-worker`,'Initialized');
  }
  return worker;
}
export default createWorker;