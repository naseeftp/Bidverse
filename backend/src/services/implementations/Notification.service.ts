import { createNotificationDTO, NotificationResponseDTO } from "../../dtos/user.dto/notification.dto";
import { INotificationRepository } from "../../repositories/interfaces/INotificationRepository";
import { INotificationService } from "../interface/INotification.service";
import { NotificationMapper } from "../../mappers/notification.mapper";

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
}