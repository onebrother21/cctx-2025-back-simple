import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import Db from './init-db';
import Utils from '@utils';
import {MyQueueNames,MyWorkerProcessors} from '@workers';

process.on('unhandledRejection', (reason, p) => {
  Utils.error("init-server",reason, 'Unhandled Rejection at Promise', p);
});
process.on('uncaughtException',err => {
  Utils.error("init-server",(new Date).toUTCString() + ' uncaughtException:', err.message);
  Utils.error("init-server",err.stack);
  process.exit(1);
});
export class MyWorkers {
  logItems = ['error','closed','init','failed','completed'];
  init = async () => {
    try{
      const {logItems} = this;
      await Db.connect();
      Object.values(MyQueueNames).forEach(k => Utils.createWorker(k,MyWorkerProcessors[k],{logItems}));
    }
    catch(e){
      Utils.error("init-workers",e);
      process.exit(1);
    }
  }
}
export default MyWorkers;
export { MyQueueNames };