import { createNotificationDTO } from "../../dtos/user.dto/notification.dto";
import { INotificationRepository } from "../../repositories/interfaces/INotificationRepository";
import { INotificationService } from "../interface/INotification.service";


export class NotificationService implements INotificationService{
    constructor(
        private _notificationRepo:INotificationRepository
    ){}
    async createAndSendNotification(data: createNotificationDTO): Promise<void> {
        await this._notificationRepo.create(data)
    }
}