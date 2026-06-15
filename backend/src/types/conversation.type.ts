import { Document, Schema } from "mongoose";
import { roles } from "./user.type";

export interface IParticipant {
    userId: Schema.Types.ObjectId;
    role: roles
}

export interface IConversation extends Document {
    participants: IParticipant[];
    lastMessage?: Schema.Types.ObjectId;
    lastMessageSnippet?: string;
    lastMessageAt: Date;
    unreadCount: Map<string, number> //Key: userId (string) , Value: unread total
    status: 'active' | 'closed';
    createdAt: Date;
    updatedAt: Date;

}