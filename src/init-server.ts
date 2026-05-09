import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import initApp from './init-app';
import initDb from './init-db';
import initCache from "./init-cache";
import initSockets from "./init-sockets";
import Utils from '@utils';

export const myApp = async () => {
  process.on('unhandledRejection', (reason, p) => {
    Utils.error("init-server",reason, 'Unhandled Rejection at Promise', p);
  });
  process.on('uncaughtException',err => {
    Utils.error("init-server",(new Date).toUTCString() + ' uncaughtException:', err.message);
    Utils.error("init-server",err.stack);
    process.exit(1);
  });
  try {
    Utils.ok("env",`${Utils.env()}`);
    const port = process.env.PORT || 3000;
    const hostname = process.env.HOSTNAME;
    const host = Utils.getNetworkAddress();
    const domain = host + (!Utils.isEnv(["production"])?`:${port}`:"");

    await initDb();
    const cache = await initCache({reload:true});
    await cache.save({domain});

    const app = express();
    initApp(app,cache);
    const {server} =  initSockets(app,cache);

    server.listen(port,() => {
      Utils.ok("server",hostname);
      Utils.ok("network",`${domain} is listening...`);
    });
  }
  catch(e){
    Utils.error("init-server",e);
    throw e;
  }
};
export default myApp;

/*
  if(!!0){//cluster.isMaster) {
    for (var i = 0; i < numCPUs; ++i) cluster.fork();
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      cluster.fork();
    });
  }
*/