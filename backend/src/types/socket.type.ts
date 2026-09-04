import { MessageDto } from "../dtos/user.dto/chat.dto";
import { NotificationResponseDTO } from "../dtos/user.dto/notification.dto";
import { roles } from "./user.type";
import { LiveAuctionStatus } from "../constants/constants";
export interface ServerToClientEvents {  // this events emitted by backend and frontend should listen
    'message:receive': (message: MessageDto) => void;//emited when new chat message arrives when userA sends a message the server process it and broadcast to userB,User B's react frontend for 'message:receive' events to instantly append this new message without page refresh
    'message:error': (data: { error: string }) => void;//event emitted when something worong during the socket opearation
    'conversation:updated': (data: {  //emitted to update the chat sidebar inbox list parameters  when a new message arrives your side bar need to resort itself to put the most recent conversation at the top
        conversationId: string;
        lastMessageSnippet: string;
        lastMessageAt: string;
        unreadCountMap?: Record<string, number>
    }) => void;
    'typing:status': (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
    'messages:read': (data: { conversationId: string; userId: string; messageIds?: string[]; unreadCount?: number; }) => void;//Emitted when a participant opens an unread chat window.
    "user:status": (data: { userId: string; isOnline: boolean }) => void;//Emitted when someone logs in or disconnects from the app.
    "message:deleted": (data: {
        conversationId: string;
        messageId: string;
        isDeletedForEveryone: boolean;
    }) => void;
    'message:edited': (data: { conversationId: string, messageId: string, newContent: string, isLastMessage: boolean; }) => void;
    'chat:activity': () => void;
    "notification:new": (notification: NotificationResponseDTO) => void;//Emitted for real-time background system alerts.

    'auction:state': (
        data: {
            auctionItemId: string;
            status: LiveAuctionStatus;
            currentHighestBid: number;
            currentHighestBidder?: string;
            bidCount: number;
            endTime: string;
        }
    ) => void;

    'auction:started': (
        data: {
            auctionItemId: string;
            startedAt: string;
        }
    ) => void;
    'auction:paused': (
        data: {
            auctionItemId: string;
            pausedAt: string;
        }
    ) => void;
    'auction:resumed': (
        data: {
            auctionItemId: string;
        }
    ) => void;

    'auction:ended': (
        data: {
            auctionItemId: string;
            winningBidder?: string;
            status:'SOLD'|'PASSED';
            reserveMet:boolean;
            winningBid: number;
        }
    ) => void;

    'bid:new': (
        data: {
            auctionItemId: string;
            amount: number;
            bidderId: string;
            bidCount: number;
        }
    ) => void;

    'auction:error': (
        data: {
            error: string;
        }
    ) => void;
    'auction:user_joined': (data: {
        auctionItemId: string;
        userId: string;
        userName: string;
        activeCount: number;
    }) => void;
    'auction:user_left': (data: {
        auctionItemId: string;
        userId: string;
        userName: string;
        activeCount: number;
    }) => void;
    'auction:round': (data: {
        auctionItemId: string;
        round: number;
        roundEndsAt: string;
    }) => void;

}

export interface ClientToServerEvents {
    'message:send': (data: { conversationId: string; content: string }) => void;
    'user:online': (userId: string) => void;
    "conversation:join": (conversationId: string) => void;//sent when user clicks a chat from their inbox list side bar  
    "conversation:leave": (conversationId: string) => void;//Sent when a user closes a chat screen or switches tabs.
    "typing:status": (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
    "messages:read": (data: { conversationId: string; userId: string }) => void;
    'users:get_online': (callback: (onlineIds: string[]) => void) => void;

    'auction:join': (auctionItemId: string) => void;
    'auction:leave': (auctionItemId: string) => void;
    'auction:start': (auctionItemId: string) => void;
    'auction:pause': (auctionItemId: string) => void;
    'auction:resume': (auctionItemId: string) => void;
    'auction:end': (auctionItemId: string) => void;
    'bid:place': (data: { auctionItemId: string; amount: number; }) => void;
}

export interface SocketData {
    userId: string;
    role: roles;
    userName: string;
    auctionRooms?: Set<string>;             //Structure for custom variables attached directly to the network connection
}