import { Server, Socket } from "socket.io";
import Models from "@models";
import Types from "@types";
import Utils from "@utils";

export type SocketUser = {
  id:string;
  username:string;
  app:string,
  role:string;
  img?:string;
}
export type SocketMsg = {
  id:string
  type:string,
  user:SocketUser,
  data:any,
  ts:number|string|Date,
};
const userSockets: Map<string,Socket> = new Map();

const AppUsage = Models.AppUsage;
const {ACTIVE,INACTIVE} = Types.IProfileStatuses;

export class WebSocketService {
  private static io: Server;
  static getUserBySocketId = (socket:Socket):string|null => { 
    for (let [key, value] of userSockets) {
      if(value.id === socket.id) return key;
    }
    return null;
  }
  static getSocketByUserId = (userId:string):Socket|null => {
    const socket = userSockets.get(userId);
    return socket && socket.connected? socket : null;
  };
  static connectAndCheck = (socket:Socket,verbose?:boolean):void => {
    Utils.log(`New connection: ${socket.id}`);
    if(verbose){
      Utils.log("socket",socket.handshake.auth);// - implement token check
      Utils.log("socket",socket.handshake.query);
    }
  };
  static initialize(io:Server) {
    this.io = io;
    this.io.of("/admn-ctrl").adapter.on("create-room",(room:string) => {
      Utils.log(`Room "${room}" was created`);
    });
    this.io.of("/admn-ctrl").on("connection", (socket:Socket) => {
      this.connectAndCheck(socket);
      socket.on('client_to_server',async (m:string) => {
        const {type,user,data,id:socketId} = JSON.parse(m) as SocketMsg;
        // Utils.debug({type,user:user.username,socketId});
        if(socket.id !== socketId) socket.emit("error", { message:"socket mismatch"});
        else switch(type){
          case "register":{
            try {
              const {app,id:userId} = user;
              const {deviceId} = data as {deviceId:string|null};
              const roomDocs = await Models.MsgChain.find({app,type:"channel"});
              const rooms = roomDocs.map(r => r.preview() as any);
              const userProfile = await Models.Profile.findById(userId);
              const device = deviceId?await Models.AppDevice.findById(deviceId):null;

              if(!userProfile) throw new Utils.AppError(400,"no profile found");
              userSockets.set(userId,socket);
              userProfile.status = ACTIVE;
              userProfile.meta.lastUse = new Date();
              await userProfile.saveMe();
              if(device){
                device.socket = socket.id;
                device.meta.lastUse = new Date();
                await device.saveMe();
              }
              const msg = {type:"registered",data:{user,rooms}};
              this.emitToSocket(socket,msg);
              Utils.log(`Profile ${userId} registered with socketId: ${socket.id}`);
            }
            catch (error:any) {this.emitErrorToSocket(socket,error);}
            break;
          }
          case "addChannel":{
            try {
              const {app,id:creator} = user;
              const {name:channelName} = data as {name:string};
              if(!channelName) throw new Utils.AppError(400,"no channel provided");
              const channel = new Models.MsgChain({name:channelName,app,creator});
              // channel.users.push(userId as any); 
              // do i need to to store joined users on the db
              // unless this represents a group
              await channel.saveMe();
              const channelId = channel.id;
              await socket.join(`room:${channelId}`);
              const viewerCount = await this.getViewerCount(channelId);
              this.emitToChannel(channelId,{id:socketId,user,type:"stats",data:{
                channelId,
                channelName,
                viewerCount
              }});
              Utils.log(`Profile ${creator} added channel ${channelName} (${channelId})`);
            }
            catch (error:any) {
              socket.emit("error", { message: error.message });
            }
            break;
          }
          case "joinChannel":{
            try {
              const {id:userId} = user;
              const {channelId} = data as {channelId:string};
              if(!channelId) throw new Utils.AppError(400,"no channel provided");
              const channel = await Models.MsgChain.findByIdAndUpdate(channelId,{
                $set:{status:Types.IMsgChainStatuses.ACTIVE},
                $addToSet:{users:userId}
              });
              if(!channel) throw new Utils.AppError(400,"no channel found");
              await socket.join(`room:${channelId}`);
              const viewerCount = await this.getViewerCount(channelId);
              const channelName = channel.name;
              this.emitToChannel(channelId,{type:"stats",data:{
                channelId,
                channelName,
                viewerCount,
              }});
              Utils.log(`Profile ${userId} joined channel ${channelName} (${channelId})`);
            }
            catch (error:any) {
              Utils.error(error.message);
              socket.emit("error", { message: error.message });
            }
            break;
          }
          case "sendComment":{
            try {
              const { app,id } = user;
              const { channelId,text:body } = data;
              if(!channelId || !body) throw new Utils.AppError(400, "Invalid comment data");
              const comment = new Models.Message({body,app,author:id as any,type:"live"});
              await comment.saveMe();
              
              const channel = await Models.MsgChain.findByIdAndUpdate(channelId,{
                $set:{status:Types.IMsgChainStatuses.ACTIVE},
                $push:{msgs:[comment]}
              });
              if(!channel) throw new Utils.AppError(400,"no channel found");
              this.emitToChannel(channelId,{type:"comment",data:comment.json()});
            }
            catch (error:any) {socket.emit("error", { message: error.message });}
            break;
          }
          case "sendReaction":{
            try {
              const { id } = user;
              const { channelId,commentId,type } = data;
              if(!channelId  || !commentId || !type) throw new Utils.AppError(400, "Invalid reaction data");  
              const reaction = {type,time:new Date(),user:id};
              const comment = await Models.Message.findByIdAndUpdate(commentId,{
                $push:{reactions:[reaction]}
              });
              if(!comment) throw new Utils.AppError(400,"no comment provided");
              this.emitToChannel(channelId,{type:"reaction",data:{user,commentId,reaction}});
            }
            catch (error:any) {
              Utils.error(error.message);
              socket.emit("error", { message: error.message });
            }
            break;
          }
          case "leaveChannel":{
            try {
              const { id:userId } = user;
              const {channelId} = data;
              if(!channelId) return;
              const channel = await Models.MsgChain.findByIdAndUpdate(channelId,{
                $pull:{users:{_id:userId }}
              });
              if(!channel) throw new Utils.AppError(400,"no channel provided");
              socket.leave(`room:${channelId}`);
              const viewerCount = await this.getViewerCount(channelId);
              this.emitToChannel(channelId,{type:"stats",data:{channelId,viewerCount}});
              Utils.log(`Profile ${userId} left channel ${channelId}`);
            }
            catch (error:any) {
              Utils.error(error.message);
              socket.emit("error", { message: error.message });
            }
            break;
          }
          case "chat-msg":{
            const {msg} = data as {msg:string,sender:string};
            this.emitToSocket(socket,{type:"chat-msg",data});
            break;
          }
        }
      });
      socket.on('disconnect', async () => {
        const userId = this.getUserBySocketId(socket);
        const userProfile = await Models.Profile.findById(userId);
        if(userId && userProfile) {
          userSockets.delete(userId);
          userProfile.status = INACTIVE;
          await userProfile.saveMe();
          Utils.log(`Profile ${userId} disconnected and marked as inactive.`);
        }
      });
    });
  }
  static emitErrorToSocket(socket:Socket,e:Error){
    Utils.error(e.message);
    socket.emit("error", { message: e.message });
  }
  static emitToSocket(socket:Socket,msg:Partial<SocketMsg>) {
    socket.emit("server_to_client",JSON.stringify({...msg,ts:new Date()}));
  }
  static emitToChannel(channelId: string,msg:Partial<SocketMsg>) {
    const channel = this.io.of("/admn-ctrl").to(`room:${channelId}`);
    channel.emit("server_to_client",JSON.stringify({...msg,ts:new Date()}));
  }
  static async getViewerCount(channelId: string): Promise<number> {
    const room = this.io.of("/admn-ctrl").adapter.rooms.get(`room:${channelId}`);
    return room ? room.size : 0;
  }
  static async notifyChannel(channelId: string, message: string) {
    this.io.of("/admn-ctrl").to(`room:${channelId}`).emit("systemMessage", { message });
  }
}
