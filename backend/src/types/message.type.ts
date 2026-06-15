import { Document, Schema } from "mongoose";
import { roles } from "./user.type";

export interface IMessageAttachment {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
export type MessageFormat = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface IMessageDocument extends Document {
    conversationId: Schema.Types.ObjectId;
    senderId: Schema.Types.ObjectId;
    senderRole: roles;
    content?: string;     // Optional if the message is purely a file attachment
    attachment?: IMessageAttachment;
    messageType: MessageFormat;
    readBy: Schema.Types.ObjectId[];
    deletedFor: Schema.Types.ObjectId[];
    isDeletedForEveryone: boolean;
    createdAt: Date;
    updatedAt: Date;

}