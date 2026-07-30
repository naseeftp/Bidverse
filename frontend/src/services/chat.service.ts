import axiosInstance from "../api/axios.instance";
import { BASE_ROUTES, CHAT_ROUTES } from "../constants/api.constant";
import type { ApiResponse } from "../types/auth.type";
import type { ConversationDTO, MarkReadResponseDTO, MessageDto } from "../types/chat.dto";
import { apiErrorHandler } from "../utils/error.handle";
import type { SendMessageInputDTO } from "../types/chat.dto";

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
            const response = await axiosInstance.get<ConversationDTO, ApiResponse<ConversationDTO[]>>(url)
            return {
                success: true,
                data: response.data,
                message: response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed get conversation')

        }
    }
    async sendMessage(payload: SendMessageInputDTO) {
        try {
            const url = `${BASE_ROUTES.CHAT}${CHAT_ROUTES.SEND_MESSAGE}`;
            const response = await axiosInstance.post<MessageDto, ApiResponse<MessageDto>>(url, payload);
            return {
                success: true,
                data: response.data,
                message: response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to send message')
        }
    }
    async getMessages(conversationId: string) {
        try {
            const url = `${BASE_ROUTES.CHAT}${CHAT_ROUTES.GET_MESSAGES}/${conversationId}`;
            const response = await axiosInstance.get<MessageDto, ApiResponse<MessageDto[]>>(url)
            return {
                success: true,
                message: response.message,
                data: response.data
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to retrieve messages')
        }
    }
    async deleteForEveryOne(messageId:string){
        try {
            const url=`${BASE_ROUTES.CHAT}${CHAT_ROUTES.DELETE_EVERYONE}/${messageId}`;
            const response=await axiosInstance.delete<MessageDto,ApiResponse<MessageDto>>(url)
            return{
                success:true,
                message:response.message,
                data:response.data
            }
        } catch (error) {
         return apiErrorHandler(error, 'Failed to delete message')
        }
    }
    async editMessage(messageId:string,newContent:string){
        try {
            const url=`${BASE_ROUTES.CHAT}${CHAT_ROUTES.EDIT_MESSAGE}/${messageId}`
            const response=await axiosInstance.patch<MessageDto,ApiResponse<MessageDto>>(url,{content:newContent});
            return{
                success:true,
                data:response.data,
                message:response.message
            }
        } catch (error) {
           return apiErrorHandler(error, 'Failed to edit message')
        }
    }

    async deleteForMe(messageId:string){
      try {
        const url=`${BASE_ROUTES.CHAT}${CHAT_ROUTES.DELETE_FOR_ME}/${messageId}`;
        const response=await axiosInstance.patch<MessageDto,ApiResponse<MessageDto>>(url);
        return{
            success:true,
            message:response.message,
            data:response.data
        }
      } catch (error) {
         return apiErrorHandler(error, 'Failed to delete message')
      }
    }

    async markMessageRead(conversationId:string){
        try {
            const url=`${BASE_ROUTES.CHAT}${CHAT_ROUTES.MARK_AS_READED}/${conversationId}`;
            const response=await axiosInstance.patch<MarkReadResponseDTO,ApiResponse<MarkReadResponseDTO>>(url)
            return{
                success:true,
                data:response.data,
                message:response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to read message')
        }
    }
    async getUnreadCountForUser(){
        try {
            const url=`${BASE_ROUTES.CHAT}${CHAT_ROUTES.UNREAD_COUNT}`;
            const response=await axiosInstance.get<number,ApiResponse<number>>(url)
            return{
                success:true,
                data:response.data,
                message:response.message
            }
        } catch (error) {
            return apiErrorHandler(error, 'Failed to get Unread Count')
        }
    }
}

export default new ChatService()