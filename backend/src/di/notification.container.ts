import { NotificationRepository } from "../repositories/implementations/NotificationRepository";
import { NotificationController } from "../controllers/implimentations/Notification.controller";
import { NotificationService } from "../services/implementations/Notification.service";

const notificationRepo = new NotificationRepository()
const notificationService = new NotificationService(notificationRepo);
export const notificationController = new NotificationController(notificationService)