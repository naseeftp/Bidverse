import { ConversationDTO } from "../../dtos/user.dto/chat.dto";

export interface IChatService{
 getOrCreateConversation(participants:{userId:string;role:string}[]):Promise<ConversationDTO>
}