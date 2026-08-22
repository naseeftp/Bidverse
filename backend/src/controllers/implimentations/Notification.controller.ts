import { INotificationService } from "../../services/interface/INotification.service";
import { INotificationController } from "../interfaces/INotification.controller";

export class NotificationController implements INotificationController{
    constructor (
        private _notificationService:INotificationService
    ){}
}