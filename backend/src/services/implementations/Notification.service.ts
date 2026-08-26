import { createNotificationDTO, NotificationResponseDTO } from "../../dtos/user.dto/notification.dto";
import { INotificationRepository } from "../../repositories/interfaces/INotificationRepository";
import { INotificationService } from "../interface/INotification.service";
import { NotificationMapper } from "../../mappers/notification.mapper";
import { NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";

export class NotificationService implements INotificationService {
    constructor(
        private _notificationRepo: INotificationRepository
    ) { }
    async createAndSendNotification(data: createNotificationDTO): Promise<void> {
        await this._notificationRepo.create(data)
    }
    async findAllNotificationForUser(userId: string): Promise<NotificationResponseDTO[]> {
        const notifications = await this._notificationRepo.findAllNotificationForUser(userId);
        const mappedNotifications = notifications.map((notification) => NotificationMapper.toNotificationResponseDTO(notification))
        return mappedNotifications
    }
    async markAsRead(userId: string, notificationId: string): Promise<NotificationResponseDTO> {
        const notification = await this._notificationRepo.findById(notificationId);
        if (!notification) {
            throw new NotFoundError(MESSAGES.NOTIFICATION_NOT_FOUND)
        }
        if (notification.recipientId.toString() !== userId) {
            throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
        };
        const markAsReadNotification = await this._notificationRepo.updateById(notificationId, { isRead: true, readAt: new Date() });
        if (!markAsReadNotification) {
            throw new NotFoundError(MESSAGES.NOTIFICATION_NOT_FOUND)
        }
        return NotificationMapper.toNotificationResponseDTO(markAsReadNotification)
    }
    async markAllRead(userId: string): Promise<NotificationResponseDTO[]> {
        const result = await this._notificationRepo.markAllRead(userId)
        return result.map((notification) => NotificationMapper.toNotificationResponseDTO(notification))
    }
}