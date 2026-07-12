import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../../config/env';
import { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../types/socket.type';
import { IMessageDocument } from '../../types/message.type';
import mongoose from 'mongoose';
import { Message } from '../../models/message.model';
import { MessageType } from '../../constants/constants';


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
            const role=socket.handshake.auth.role;
            if (userId) {
                this._onlineUsers.set(userId, socket.id);
                socket.data.userId = userId;
                if(role){
                    socket.data.role=role;
                }
                this._io?.emit('user:status', { userId: userId, isOnline: true });
            }
            socket.on('conversation:join', (conversationId: string) => {
                const targetRoom = `room:${conversationId}`;
                socket.join(targetRoom);
            })
            socket.on('conversation:leave', (conversationId: string) => {
                const targetRoom = `room:${conversationId}`;
                socket.leave(targetRoom)
            });
            socket.on('message:send', async (data: { conversationId: string, content: string }) => {
                try {
                    const senderId = socket.data.userId;
                    const sendRole = socket.data.role;
                    if (!senderId||sendRole) {
                        socket.emit('message:error', { error: "Authentication missing or profile role unspecified. Message rejected." });
                        return;
                    }
                    const savedMessageDoc: IMessageDocument = await Message.create({
                        conversationId: new mongoose.Types.ObjectId(data.conversationId),
                        senderId: new mongoose.Types.ObjectId(senderId),
                        senderRole: sendRole,
                        content: data.content,
                        messageType: MessageType.TEXT,
                        readBy: [new mongoose.Types.ObjectId(senderId)],
                        deletedFor: [],
                        isDeletedForEveryone: false
                    })
                    const targetRoom = `room:${data.conversationId}`
                    this._io?.to(targetRoom).emit('message:receive', savedMessageDoc);

                    this._io?.to(targetRoom).emit('conversation:updated', {
                        conversationId: data.conversationId,
                        lastMessageSnippet: data.content.substring(0, 60),
                        lastMessageAt: savedMessageDoc.createdAt.toISOString()
                    });
                } catch {
                  socket.emit('message:error', { error: "Internal server failed to route your text frame." });
                }
            });
            socket.on('disconnect',()=>{
                if(socket.data.userId){
                    this._onlineUsers.delete(socket.data.userId);
                    this._io?.emit('user:status',{userId:socket.data.userId,isOnline:false})
                }
            })

        });
        

    }
}

export const socketService = new SocketService();