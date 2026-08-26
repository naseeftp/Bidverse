import { INotificationDocument } from "../../types/notification.type";
import { IBaseRepository } from "./IBase.repository";

export interface INotificationRepository extends IBaseRepository<INotificationDocument> {
    findAllNotificationForUser(userId: string): Promise<INotificationDocument[]>
    markAllRead(userId: string): Promise<INotificationDocument[]>
}