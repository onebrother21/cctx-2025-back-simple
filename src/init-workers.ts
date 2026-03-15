import dotenv from 'dotenv';
dotenv.config();

import db from './init-db';
import Utils from '@utils';
import {MyQueueNames,MyWorkerProcessors} from '@workers';

export class MyWorkers {
  logItems = ['error','closed','init','failed','completed'];
  init = async () => {
    try{
      const {logItems} = this;
      await db.connect();
      Object.values(MyQueueNames).forEach(k => Utils.createWorker(k,MyWorkerProcessors[k],{logItems}));
    }
    catch(e){
      Utils.error(e);
      process.exit(1);
    }
  }
}
export default MyWorkers;
export { MyQueueNames };