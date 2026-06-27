import { data } from "react-router-dom";
import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, CHAT_ROUTES } from "../constants/api.constant";
import type { ApiResponse } from "../types/auth.type";
import type { ConversationDTO } from "../types/chat.dto";
import { apiErrorHandler } from "../utils/error.handle";

class ChatService {
    async getOrCreateConversation(data: { receiverId: string, receiverRole: string }) {
        try {
            const url = `${BASE_ROUTES.CHAT}${CHAT_ROUTES.GET_OR_CREATE_CONVO}`;
            const response = await axiosInstance.post<ConversationDTO, ApiResponse<ConversationDTO>>(url, data)
            return {
                success: true,
                data: response.data,
                message: response.message
            }

        } catch (error) {
            return apiErrorHandler(error, 'Failed get conversation')
        }
    }
    async getUserConversations() {
        try {
            const url = `${BASE_ROUTES.CHAT}${CHAT_ROUTES.GET_USER_CONVO}`;
            const response=await axiosInstance.get<ConversationDTO,ApiResponse<ConversationDTO[]>>(url)
            return {
                success:true,
                data:response.data,
                message:response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed get conversation')

        }
    }

}

export default new ChatService()