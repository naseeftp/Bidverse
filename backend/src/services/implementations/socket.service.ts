import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../../config/env';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../types/socket.type';



type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

export class SocketService {
    private _io: TypedServer | null = null;
    private _onlineUsers = new Map<string, string>()// used to store user id sockt id, Map stred in server ram

    public initialize(server: HttpServer): void {
        const envOrgins = [env.CLIENT_URL]
            .filter((url): url is string => !!url)
            .map((url) => url.trim());

        this._io = new SocketIOServer(server, {
            cors: {
                origin: [...envOrgins],
                methods: ['GET', 'POST'],
                credentials: true
            },
            path: "/socket"
        })
        this.setUpeventListners()
    }
    private setUpeventListners(): void {
        if (!this._io) {
            return
        };
        this._io.on('connection', (socket: TypedSocket) => {
            const userId = socket.handshake.auth.userId;
            const role = socket.handshake.auth.role;
            if (userId) {
                this._onlineUsers.set(userId, socket.id);
                socket.data.userId = userId;
                if (role) {
                    socket.data.role = role;
                }
                this._io?.emit('user:status', { userId: userId, isOnline: true });
            }
            socket.on('users:get_online', (callback) => {
                const currentOnlineIds = Array.from(this._onlineUsers.keys());
                callback(currentOnlineIds)
            })
            socket.on('conversation:join', (conversationId: string) => {
                const targetRoom = `room:${conversationId}`;
                socket.join(targetRoom);
            })
            socket.on('conversation:leave', (conversationId: string) => {
                const targetRoom = `room:${conversationId}`;
                socket.leave(targetRoom)
            });

            socket.on('typing:status', (data) => {
                const targetRoom = `room:${data.conversationId}`
                socket.to(targetRoom).emit('typing:status', {
                    conversationId: data.conversationId,
                    userId: data.userId,
                    isTyping: data.isTyping
                })
            })
            socket.on('message:send', (data) => {
                if (!socket.data.userId) {
                    socket.emit('message:error', { error: 'Authentication data missing from socket session.' });
                    return;
                }
            })

            socket.on('disconnect', () => {
                if (socket.data.userId) {
                    this._onlineUsers.delete(socket.data.userId);
                    this._io?.emit('user:status', { userId: socket.data.userId, isOnline: false })
                }
            })

        });


    }
    //methods for backend services and controllers
    public isUserOnline(userId: string): boolean {
        return this._onlineUsers.has(userId)
    }
    public getUserSocketId(userId: string): string | undefined {
        return this._onlineUsers.get(userId)
    }
    public emitToUser<Ev extends keyof ServerToClientEvents>(
        userId: string, event: Ev, payload: Parameters<ServerToClientEvents[Ev]>[0]
    ): void {
        const socketId = this.getUserSocketId(userId);
        if (socketId && this._io) {
            const emitter = this._io.to(socketId) as unknown as {
                emit: (e: Ev, p: typeof payload) => void;
            };
            emitter.emit(event, payload);

        }
    }
    public emitToRoom<Ev extends keyof ServerToClientEvents>(conversationId: string, event: Ev, payload: Parameters<ServerToClientEvents[Ev]>[0]): void {
        if (!this._io) return;
        const targetRoom = `room:${conversationId}`;
        const emitter = this._io.to(targetRoom) as unknown as {
            emit: (e: Ev, p: typeof payload) => void;
        };
        emitter.emit(event, payload);
    }

    public emitToRoomExcluding<Ev extends keyof ServerToClientEvents>(
        conversationId: string,
        excludeSocketId: string,
        event: Ev,
        payload: Parameters<ServerToClientEvents[Ev]>[0]
    ): void {
        if (!this._io) return;
        const targetRoom = `room:${conversationId}`;

        const emitter = this._io.to(targetRoom).except(excludeSocketId) as unknown as {
            emit: (e: Ev, p: typeof payload) => void;
        };
        emitter.emit(event, payload);
    }

}

export const socketService = new SocketService();