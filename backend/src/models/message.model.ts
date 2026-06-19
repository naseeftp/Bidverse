import mongoose, { Schema } from "mongoose";
import { IMessageDocument } from "../types/message.type";
import { Roles } from "../constants/constants";
import { MessageType } from "../constants/constants";

const AttachmentSchema = new Schema({
    url: { type: String, required: true },
    fileName: { type: String, required: true, trim: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true }
}, { _id: false });

const MessageSchema = new Schema<IMessageDocument>({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: Object.values(Roles),
        required: true
    },
    content: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    attachment: {
        type: AttachmentSchema,
        required: false,
        default: null
    },
    messageType: {
        type: String,
        enum: Object.values(MessageType),
        default: 'text',
        required: true
    },
    readBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    deletedFor: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    isDeletedForEveryone: {
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }

}, {
    timestamps: true
})

MessageSchema.index({ conversationId: 1, createdAt: -1 });
export const Message = mongoose.model<IMessageDocument>('Message', MessageSchema)
