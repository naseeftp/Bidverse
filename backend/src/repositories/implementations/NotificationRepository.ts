import { Notification } from "../../models/notification.model";
import { INotificationDocument } from "../../types/notification.type";
import { INotificationRepository } from "../interfaces/INotificationRepository";
import { BaseRepository } from "./Base.repository";

export class NotificationRepository extends BaseRepository<INotificationDocument> implements INotificationRepository{
    constructor(){
        super(Notification)
    }
}