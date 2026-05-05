import Express from "express";
import http from 'http';
import { Server } from 'socket.io';

import Services from '@services';
import Utils from "@utils";
import RedisCache from "./init-cache";
import { ConfigureCorsSocketIo } from "@middleware";
import { GlassSocketsService } from './apps/glass';

const whitelist = JSON.parse(process.env.ORIGINS||"[]");

const initializeSockets = (app:Express.Application,cache:RedisCache) => {
  const server = http.createServer(app);
  const io = new Server(server,ConfigureCorsSocketIo(cache));
  Services.Sockets.initialize(io);
  GlassSocketsService.initialize(io);
  return {server,io};
};
export {initializeSockets};