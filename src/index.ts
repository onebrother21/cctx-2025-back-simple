import dotenv from 'dotenv';
dotenv.config();

import cluster from 'cluster';
import os from 'os';
import express, { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';

import db from './init/db';
import initialize from './init/app';
//import {initializeSockets} from "./init/sockets";
import Utils from './utils';

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;
const host = process.env.HOST;
const numCPUs = os.cpus().length;
const cache = new Utils.RedisCache();

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
});
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

class myServer {
  app:Express = express();
  server:http.Server;
  init = async () => {
    if(!!0){//cluster.isMaster) {
      for (var i = 0; i < numCPUs; ++i) cluster.fork();
      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
      });
    } 
    else {
      await db.connect();
      await cache.connect();
      initialize(this.app,cache);
      //Utils.listRoutes(this.app);
      //const {server} =  initializeSockets(this.app);
      //this.server = server;
      this.app.listen(port,() => {
        Utils.print("ok","env",`Env: ${process.env.NODE_ENV.toLocaleUpperCase()}`);
        Utils.print("ok","server",`${hostname}:${port} is up an running...`);
      });
    }
  };
}
export default myServer;