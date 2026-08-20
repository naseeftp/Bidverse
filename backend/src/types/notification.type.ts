import { Document, Types } from "mongoose"
import { Role } from "../dtos/Common.dto";
import { NotificationEvent, NotificationType } from "../constants/notification.constant";

export interface INotification {
    recipientId: Types.ObjectId;
    recipientRole: Role;
    type: NotificationType;
    event: NotificationEvent;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: Date,
    createdAt: Date;
    updatedAt: Date;
}

export type INotificationDocument = INotification & Document