import { ConversationDTO, MessageDto, SendMessageInputDTO } from "../../dtos/user.dto/chat.dto";
import { Role } from "../../dtos/Common.dto";
export interface IChatService{
 getOrCreateConversation(participants:{userId:string;role:string}[]):Promise<ConversationDTO>
 getUserConversations(userId:string):Promise<ConversationDTO[]>
 sendMessage(senderId:string,senderRole:Role,payload:SendMessageInputDTO):Promise<MessageDto>
 getMessages(conversationId:string):Promise<MessageDto[]>
}