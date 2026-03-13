import dotenv from 'dotenv';
dotenv.config();

import cluster from 'cluster';
import os from 'os';
import express, { Express } from 'express';
import http from 'http';

import App from './init-app';
import Db from './init-db';
import RedisCache from "./init-cache";
import {initializeSockets} from "./init-sockets";

import Utils from '@utils';

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;
const host = process.env.HOST;
const numCPUs = os.cpus().length;

process.on('unhandledRejection', (reason, p) => {
  Utils.error(reason, 'Unhandled Rejection at Promise', p);
});
process.on('uncaughtException',err => {
  Utils.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  Utils.error(err.stack);
  process.exit(1);
});

const getNetworkAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const int of interfaces[name]) {
      if (int.family === 'IPv4' && !int.internal) {
        return int.address;
      }
    }
  }
  const env = Utils.env();
  return /local/i.test(env)?'localhost':'0.0.0.0';
};

export interface myApp {
  app:Express;
  server:http.Server;
}
export class myApp {
  init = async () => {
    try {
      const db = await Db.connect();
      const cache = await RedisCache.connect();
      const app = express();
      const host = getNetworkAddress();
      const domain = `${host}:${port}`;//dev env -> include port
      await cache.save({domain});

      App.init(app,cache);
      const {server} =  initializeSockets(app);

      this.app = app;
      this.server = server;
      this.server.listen(port,() => {
        Utils.print("ok","ok",`Env: ${process.env.NODE_ENV.toLocaleUpperCase()}`);
        Utils.print("ok","ok",`Server: ${hostname}`);
        Utils.print("ok","ok",`Network: ${host}:${port} is listening...`);
      });
    }
    catch(e){throw e;}
  }
}
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