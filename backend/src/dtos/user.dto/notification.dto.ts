import { Types } from "mongoose";
import { Role } from "../Common.dto";
import { NotificationEvent, NotificationType } from "../../constants/notification.constant";

export interface createNotificationDTO{
    recipientId:Types.ObjectId;
    recipientRole:Role;
    type:NotificationType;
    event:NotificationEvent;
    title:string;
    message:string
}