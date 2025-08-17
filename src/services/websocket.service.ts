import { Server, Socket } from "socket.io";
import Models from "../models";
import Utils from "../utils";

export class WebSocketService {
  private static io: Server;

  /** Initialize WebSocket Server */
  static initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"],
      },
    });
    // Listen for connections on the /livestream namespace
    this.io.of("/livestream").on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user joining a livestream channel
      socket.on("joinChannel", async (channelId: string) => {
        if (!channelId) return;
        socket.join(`room:${channelId}`);
        console.log(`User ${socket.id} joined channel ${channelId}`);

        // Send current viewer count
        const viewerCount = await this.getViewerCount(channelId);
        this.io.of("/livestream").to(`room:${channelId}`).emit("viewerCount", viewerCount);
      });

      // Handle new comment submission
      socket.on("sendComment", async ({ channelId, userId, text }) => {
        try {
          if (!channelId || !userId || !text) throw new Utils.AppError(400, "Invalid comment data");

          // Save comment in DB
          const comment = {};//await Models.Comment.create({ channel: channelId, user: userId, text });

          // Broadcast to all viewers
          this.io.of("/livestream").to(`room:${channelId}`).emit("newComment", comment);
        }
        catch (error) {
          socket.emit("error", { message: error.message });
        }
      });

      // Handle reactions (likes, etc.)
      socket.on("sendReaction", async ({ channelId, userId, type }) => {
        try {
          if (!channelId || !userId || !type) throw new Utils.AppError(400, "Invalid reaction data");

          // Save reaction in DB
          const reaction = {};//await Models.Reaction.create({ channel: channelId, user: userId, type });

          // Broadcast to all viewers
          this.io.of("/livestream").to(`room:${channelId}`).emit("newReaction", reaction);
        }
        catch (error) {
          socket.emit("error", { message: error.message });
        }
      });

      // Handle user leaving channel
      socket.on("leaveChannel", async (channelId: string) => {
        if (!channelId) return;
        socket.leave(`room:${channelId}`);
        console.log(`User ${socket.id} left channel ${channelId}`);

        // Send updated viewer count
        const viewerCount = await WebSocketService.getViewerCount(channelId);
        this.io.of("/livestream").to(`room:${channelId}`).emit("viewerCount", viewerCount);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  /** Broadcast event to a specific livestream channel */
  static broadcastToChannel(channelId: string, event: string, data: any) {
    this.io.of("/livestream").to(`room:${channelId}`).emit(event, data);
  }

  /** Get live viewer count for a channel */
  static async getViewerCount(channelId: string): Promise<number> {
    const room = this.io.of("/livestream").adapter.rooms.get(`room:${channelId}`);
    return room ? room.size : 0;
  }

  /** Notify all viewers in a channel about stream updates */
  static async notifyChannel(channelId: string, message: string) {
    this.io.of("/livestream").to(`room:${channelId}`).emit("systemMessage", { message });
  }
}
