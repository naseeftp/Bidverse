import { IConversation } from "../types/conversation.type";
import mongoose, { Schema } from "mongoose";
import { Roles } from "../constants/constants";

const ParticipantSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: Object.values(Roles),
        required: true
    }
}, { _id: false });// Prevents mongoose from creating an unnecessary nested auto-_id field

const ConversationSchema=new Schema<IConversation>({
    participants:{
        type:[ParticipantSchema]
    },
    lastMessage:{
        type:Schema.Types.ObjectId,
        ref:'Message',
        default:null,
        required:false,
    },
    lastMessageSnippet:{
        type:String,
        default:'',
        trim:true
    },
    lastMessageAt:{
        type:Date,
        default:Date.now
    },
    unreadCount:{
        type:Map,
        of:Number,
        default:new Map()
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active',
        required: true
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }

},{timestamps:true})

ConversationSchema.index({ "participants.userId": 1, lastMessageAt: -1 });
ConversationSchema.index({ "participants.userId": 1 });
ConversationSchema.index({ status: 1 });

export const Conversation= mongoose.model<IConversation>('Conversation', ConversationSchema)