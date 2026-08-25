import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, NOTIFICATION_ROUTES } from "../constants/api.constant"
import type { ApiResponse } from "../types/auth.type";
import type { NotificationResponseDTO } from "../types/notification.dto";
import { apiErrorHandler } from "../utils/error.handle"


class NotificationService{
async getAllNotifications(){
    try {
        const url=`${BASE_ROUTES.NOTIFICATION}${NOTIFICATION_ROUTES.GET_NOTIFICATION}`;
        const response=await axiosInstance.get<NotificationResponseDTO,ApiResponse<NotificationResponseDTO[]>>(url)
        return{
            success:true,
            message:response.message,
            data:response.data
        }
    } catch (error) {
        return apiErrorHandler(error,'Failed to get Notifications')
    }
}
}

export default new NotificationService()