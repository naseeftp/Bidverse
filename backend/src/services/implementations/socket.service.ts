import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../../config/env';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from '../../types/socket.type';
import { IMessageDocument } from '../../types/message.type';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export class SocketService {
    private _io: TypedServer | null = null;
    private _onlineUsers = new Map<string, string>(); // Maps userId string -> socketId string

    public initialize(server: HttpServer): void {
        const envOrigins = [env.CLIENT_URL]
            .filter((url): url is string => !!url)
            .map((url) => url.trim());

        this._io = new SocketIOServer(server, {
            cors: {
                origin: [...envOrigins],
                methods: ['GET', 'POST'],
                credentials: true
            },
            path: '/socket.io'
        });

        this._io.on('connection', (socket: TypedSocket) => {
            const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId as string;
            const role = socket.handshake.auth?.role || socket.handshake.query?.role as SocketData["role"];

            if (!userId) {
                socket.disconnect();
                return;
            }

            socket.data.userId = userId;
            socket.data.role = role;
            this._onlineUsers.set(userId, socket.id);

            this._io?.emit('user:status', { userId, isOnline: true });

            socket.join(`user:${userId}`);

            socket.on('user:online', (id: string) => {
                if (!this._onlineUsers.has(id)) {
                    this._onlineUsers.set(id, socket.id);
                    this._io?.emit("user:status", { userId: id, isOnline: true });
                }
            });

            socket.on("conversation:join", (conversationId: string) => {
                const room = `chat:${conversationId}`;
                void socket.join(room);
            });

            socket.on("conversation:leave", (conversationId: string) => {
                const room = `chat:${conversationId}`;
                void socket.leave(room);
            });

            socket.on("typing:status", (data) => {
                const room = `chat:${data.conversationId}`;
                socket.to(room).emit("typing:status", {
                    conversationId: data.conversationId,
                    userId: data.userId,
                    isTyping: data.isTyping
                });
            });

            socket.on("messages:read", (data) => {
                const room = `chat:${data.conversationId}`;
                socket.to(room).emit("messages:read", {
                    conversationId: data.conversationId,
                    userId: data.userId
                });
            });

            socket.on("disconnect", () => {
                if (socket.data.userId) {
                    this._onlineUsers.delete(socket.data.userId);
                    this._io?.emit("user:status", { userId: socket.data.userId, isOnline: false });
                    console.log(`[Socket] Disconnected: User ${socket.data.userId}`);
                }
            });
        });
    }

    public getIO() {
        if (!this._io) throw new Error("Socket.io engine has not been initialized yet!");
        return this._io;
    }

    public isUserOnline(userId: string): boolean {
        return this._onlineUsers.has(userId);
    }

    public getUserSocketId(userId: string): string | undefined {
        return this._onlineUsers.get(userId);
    }

    public emitMessage(conversationId: string, message: IMessageDocument): void {
        const room = `chat:${conversationId}`;
        this._io?.to(room).emit("message:receive", message);

        this._io?.to(room).emit("conversation:updated", {
            conversationId,
            lastMessageSnippet: message.content || "Sent an attachment",
            lastMessageAt: (message.createdAt as unknown as Date).toISOString()
        });
    }

    public sendNotification(userId: string, notificationData: any): void {
        this._io?.to(`user:${userId}`).emit("notification:new", notificationData);
    }
}

export const socketService = new SocketService();