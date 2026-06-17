import { IMessageDocument } from "./message.type";
import { roles } from "./user.type";

export interface ServerToClientEvents{  // this events emitted by backend and frontend should listen
    'message:receive':(message:IMessageDocument)=>void;//emited when new chat message arrives when userA sends a message the server process it and broadcast to userB,User B's react frontend for 'message:receive' events to instantly append this new message without page refresh
    'message:error':(data:{error:string})=>void;//event emitted when something worong during the socket opearation
     'conversation:updated':(data:{  //emitted to update the chat sidebar inbox list parameters  when a new message arrives your side bar need to resort itself to put the most recent conversation at the top
        conversationId:string;
        lastMessageSnippet:string;
        lastMessageAt: string;
     })=>void;
     'typing:status':(data:{conversationId:string;userId:string;isTyping:boolean})=>void;
     'messages:read':(data:{conversationId:string;userId:string})=>void;//Emitted when a participant opens an unread chat window.
     "user:status": (data: { userId: string; isOnline: boolean }) => void;//Emitted when someone logs in or disconnects from the app.
     "message:deleted": (data: { 
        conversationId: string; 
        messageId: string; 
        isDeletedForEveryone: boolean; 
    }) => void;
     "notification:new": (notification: any) => void;//Emitted for real-time background system alerts.
}

export interface ClientToServerEvents{
    'user:online':(userId:string)=>void;
    "conversation:join": (conversationId: string) => void;//sent when user clicks a chat from their inbox list side bar  
    "conversation:leave": (conversationId: string) => void;//Sent when a user closes a chat screen or switches tabs.
    "typing:status": (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
    "messages:read": (data: { conversationId: string; userId: string }) => void;
}

export interface SocketData {
    userId: string;
    role: roles;
}