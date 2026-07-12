import { Document, Schema,Types} from "mongoose";
import { roles } from "./user.type";

export interface IMessageAttachment {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}
export type MessageFormat = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface IMessageDocument extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: roles;
    content?: string;     // Optional if the message is purely a file attachment
    attachment?: IMessageAttachment;
    messageType: MessageFormat;
    readBy: Types.ObjectId[];
    deletedFor: Types.ObjectId[];
    isDeletedForEveryone: boolean;
    createdAt: Date;
    updatedAt: Date;

}