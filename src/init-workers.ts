import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express,{RequestHandler,ErrorRequestHandler} from 'express';
import morgan from 'morgan';
import compression from 'compression';
import initDb from './init-db';
import initCache from "./init-cache";
import Utils from '@utils';
import {PageNotFound,SendErrorHandler} from "@middleware";
import {MyQueueNames,MyWorkerProcessors} from '@workers';

const logItems = ['error','closed','init','failed','completed'];
export const MyWorkers = async () => {
  process.on('unhandledRejection', (reason, p) => {
    Utils.error("init-server",reason, 'Unhandled Rejection at Promise', p);
  });
  process.on('uncaughtException',err => {
    Utils.error("init-server",(new Date).toUTCString() + ' uncaughtException:', err.message);
    Utils.error("init-server",err.stack);
    process.exit(1);
  });
  try{
    Utils.ok("env",Utils.envName());
    Utils.ok("isProd",Utils.isProd());
    
    const port =  Number(Utils.getVar("PORT")) || 3300;
    const hostname = Utils.getVar("HOSTNAME") || "";
    const host = Utils.getNetworkAddress();
    const domain = host + (!Utils.isProd()?`:${port}`:"");
    const cache = await initCache();
    const db = await initDb();

    await cache.loadAll();
    await cache.save("cctx-dev-back",{domain});
    
    if(Utils.isEnv("live-render")){
      const app = express();
      app.use(compression());
      app.use(morgan('dev', {
        skip: function (req, res) {
          return "HEAD" == req.method || "OPTIONS"  == req.method && res.statusCode == 200;
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
    Object.values(MyQueueNames).forEach(k => Utils.createWorker(k,MyWorkerProcessors[k],{logItems}));
  }
  catch(e){
    Utils.error("init-workers",e);
    process.exit(1);
  }
};
export default MyWorkers;
export { MyQueueNames };