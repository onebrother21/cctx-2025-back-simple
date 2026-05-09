import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express,{RequestHandler,ErrorRequestHandler} from 'express';
import morgan from 'morgan';
import compression from 'compression';
import Db from './init-db';
import RedisCache from "./init-cache";
import Utils from '@utils';
import {PageNotFound,SendErrorHandler} from "@middleware";
import {MyQueueNames,MyWorkerProcessors} from '@workers';

process.on('unhandledRejection', (reason, p) => {
  Utils.error("init-workers",reason, 'Unhandled Rejection at Promise', p);
});
process.on('uncaughtException',err => {
  Utils.error("init-workers",(new Date).toUTCString() + ' uncaughtException:', err.message);
  Utils.error("init-workers",err.stack);
  process.exit(1);
});

export class MyWorkers {
  logItems = ['error','closed','init','failed','completed'];
  init = async () => {
    try{
      Utils.ok("env",`${Utils.env()}`);
      const port = process.env.PORT || 3000;
      const hostname = process.env.HOSTNAME;
      const host = Utils.getNetworkAddress();
      const domain = host + (!Utils.isEnv(["production"])?`:${port}`:"");
      
      await Db.connect();
      const cache = await RedisCache.connect({reload:true});
      await cache.save({domain});
      
      if(Utils.isEnv("live-render")){
        const app = express();
        app.use(compression());
        app.use(morgan('dev', {
          skip: function (req, res) {
            return ["HEAD","OPTIONS"].includes(req.method) && res.statusCode == 200;
          }
        }));
        app.use("/",(req,res) => res.json({ready:true}));
        app.use('/*splat',PageNotFound() as RequestHandler);
        app.use(SendErrorHandler() as ErrorRequestHandler);
        app.listen(port,() => {
          Utils.ok("server",hostname);
          Utils.ok("network",`${domain} is listening...`);
        });
      }
      const {logItems} = this;
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