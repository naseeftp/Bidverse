import { createNotificationDTO } from "../../dtos/user.dto/notification.dto";

export interface INotificationService{
  createAndSendNotification(data:createNotificationDTO):Promise<void>  
}