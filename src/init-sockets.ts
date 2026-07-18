import Express from "express";
import http from 'http';
import { Server } from 'socket.io';

import Services from '@services';
import Utils from "@utils";
import { RedisCache } from "./init-cache";
import { ConfigureCorsSocketIo } from "@middleware";
import { CCTX_AdmnSocketsService } from './apps/cctx_admn';
import { GlassSocketsService } from './apps/glass';

export const initSockets = (app:Express.Application,cache:RedisCache) => {
  const server = http.createServer(app);
  const io = new Server(server,ConfigureCorsSocketIo(cache));
  Services.Sockets.initialize(io,"/admn-ctrl");
  CCTX_AdmnSocketsService.initialize(io,"/cctx-admn-users");
  GlassSocketsService.initialize(io,"/glass-users");
  Utils.ok("sockets","Initialized");
  return server;
};
export default initSockets;