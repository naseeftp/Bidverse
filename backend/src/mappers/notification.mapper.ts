import { INotificationDocument } from "../types/notification.type";
import { NotificationResponseDTO } from "../dtos/user.dto/notification.dto";

export class NotificationMapper {
    static toNotificationResponseDTO(doc: INotificationDocument): NotificationResponseDTO {
        return {
            notificationId: doc._id.toString(),
            recipientRole: doc.recipientRole,
            type: doc.type,
            event: doc.event,
            title: doc.title,
            message: doc.message,
            isRead: doc.isRead,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }
    }
}