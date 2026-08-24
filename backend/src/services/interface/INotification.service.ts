import { createNotificationDTO, NotificationResponseDTO } from "../../dtos/user.dto/notification.dto";

export interface INotificationService {
  createAndSendNotification(data: createNotificationDTO): Promise<void>
  findAllNotificationForUser(userId: string): Promise<NotificationResponseDTO[]>
}