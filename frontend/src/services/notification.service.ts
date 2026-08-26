import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, NOTIFICATION_ROUTES } from "../constants/api.constant"
import type { ApiResponse } from "../types/auth.type";
import type { NotificationResponseDTO } from "../types/notification.dto";
import { apiErrorHandler } from "../utils/error.handle"


class NotificationService {
    async getAllNotifications() {
        try {
            const url = `${BASE_ROUTES.NOTIFICATION}${NOTIFICATION_ROUTES.GET_NOTIFICATION}`;
            const response = await axiosInstance.get<NotificationResponseDTO, ApiResponse<NotificationResponseDTO[]>>(url)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get Notifications')
        }
    }
    async markAsRead(notificationId: string) {
        try {
            const url = `${BASE_ROUTES.NOTIFICATION}${NOTIFICATION_ROUTES.MARK_AS_READ}`;
            const response = await axiosInstance.patch<NotificationResponseDTO, ApiResponse<NotificationResponseDTO>>(url, { notificationId: notificationId });
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to mark as read')
        }
    }
    async readAll() {
        try {
            const url = `${BASE_ROUTES.NOTIFICATION}${NOTIFICATION_ROUTES.READ_ALL}`;
            const response = await axiosInstance.patch<NotificationResponseDTO, ApiResponse<NotificationResponseDTO[]>>(url)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
            return
        } catch (error) {
            return apiErrorHandler(error, 'Failed to Read All')
        }
    }

}

export default new NotificationService()