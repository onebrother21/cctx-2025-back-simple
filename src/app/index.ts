import dotenv from 'dotenv';
dotenv.config();

import cluster from 'cluster';
import os from 'os';
import express, { Express } from 'express';
import http from 'http';

import App from './init-app';
import Db from './init-db';
import {initializeSockets} from "./init-sockets";
import Utils from '../utils';

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;
const host = process.env.HOST;
const numCPUs = os.cpus().length;

process.on('unhandledRejection', (reason, p) => {
  console.error(reason, 'Unhandled Rejection at Promise', p);
});
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

export interface myApp {
  app:Express;
  server:http.Server;
}
export class myApp {
  init = async () => {
    await Db.connect();
    this.app = express();
    App.init(this.app,await Utils.RedisCache.connect());
    const {server} =  initializeSockets(this.app);
    this.server = server;
    this.server.listen(port,() => {
      Utils.print("ok","ok",`Env: ${process.env.NODE_ENV.toLocaleUpperCase()}`);
      Utils.print("ok","ok",`Server: ${hostname}:${port} is up an running...`);
    });
  };
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