import { ConversationDTO, MessageDto, SendMessageInputDTO,MarkReadResponseDTO } from "../../dtos/user.dto/chat.dto";
import { Role } from "../../dtos/Common.dto";
export interface IChatService {
    getOrCreateConversation(participants: { userId: string; role: string }[]): Promise<ConversationDTO>
    getUserConversations(userId: string): Promise<ConversationDTO[]>
    sendMessage(senderId: string, senderRole: Role, payload: SendMessageInputDTO): Promise<MessageDto>
    getMessages(conversationId: string,userId:string): Promise<MessageDto[]>
    deleteForEveryOne(messageId: string, senderId: string): Promise<MessageDto>
    editMessage(messageId: string, senderId: string, newContent: string): Promise<MessageDto>
    deleteForMe(messageId: string, userId: string): Promise<MessageDto>
    markMessageRead(conversationId:string,userId:string):Promise<MarkReadResponseDTO>
}