import Express from "express";
import http from 'http';
import { Server, Socket } from 'socket.io';

import Models from '../models';
import Types from "../types";

const userSockets: Map<string, Socket> = new Map();
const {ACTIVE,INACTIVE} = Types.IUserStatuses;
const AppUsage = Models.AppUsage;

const initializeSockets = (app:Express.Application) => {
  const server = http.createServer(app);
  const io = new Server(server);
  // Register user socket
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Register event - save the socketId to the user
    socket.on('register', async (userId: string,deviceId:string) => {
      const user = await Models.User.findById(userId);
      const device = await Models.AppDevice.findById(deviceId);
      if (user) {
        userSockets.set(userId, socket);
        device.socket = socket.id;
        device.lastUse = new Date();
        user.status = ACTIVE;
        await user.saveMe();
        await device.saveMe();
        console.log(`User ${userId} registered with socketId: ${socket.id}`);
      }
    });

    // Disconnect event - mark user as inactive and remove socketId
    socket.on('disconnect', async () => {
      const user = await Models.User.findOne({ socketId: socket.id });
      if (user) {
        userSockets.delete(user.id);
        user.status = INACTIVE;
        user.saveMe();
        console.log(`User ${user._id} disconnected and marked as inactive.`);
      }
    });

    // Handle new notifications
    socket.on('new-notification', (notificationData) => {
      // Handle the notification data sent from the backend (can be pushed via socket to the front end)
      socket.emit('notification', notificationData); // Send the notification to the connected client
    });
  });
  return {server,io};
};
const getUserSocket = (userId: string): Socket|null => {
  const socket = userSockets.get(userId);
  return socket && socket.connected? socket : null;
};
export {initializeSockets,getUserSocket};