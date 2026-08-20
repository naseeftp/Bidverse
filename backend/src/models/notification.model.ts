import { NotificationEvent, NotificationType } from "../constants/notification.constant";
import { Role } from "../dtos/Common.dto";
import { INotificationDocument } from "../types/notification.type";
import mongoose, { Schema, Types } from "mongoose";

const NotificationSchema = new Schema<INotificationDocument>({
    recipientId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recipientRole: {
        type: String,
        enum: Object.values(Role),
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    event: {
        type: String,
        enum: Object.values(NotificationEvent),
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false,
        required: true
    },
    readAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

NotificationSchema.index({
    recipientId: 1,
    isRead: 1,
    createdAt: -1
})

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema)