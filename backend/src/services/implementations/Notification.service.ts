import { INotificationRepository } from "../../repositories/interfaces/INotificationRepository";
import { INotificationService } from "../interface/INotification.service";


export class NotificationService implements INotificationService{
    constructor(
        private _notificationRepo:INotificationRepository
    ){}
}