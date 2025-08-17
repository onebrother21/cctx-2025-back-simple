import dotenv from 'dotenv';
dotenv.config();

import db from './init/db';
import Utils from './utils';
import {MyQueueNames,MyWorkerProcessors} from './workers';

const cache = new Utils.RedisCache();
const logItems = ['error','closed','init','failed','completed'];

export class MyWorkers {
  init = async () => {
    try{
      await db.connect();
      await cache.connect();
      Object.values(MyQueueNames).forEach(k => Utils.createWorker(k,MyWorkerProcessors[k],{logItems}));
    }
    catch(e){
      Utils.error(e);
      process.exit(1);
    }
  }
}
export default MyWorkers;