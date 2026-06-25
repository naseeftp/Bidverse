import { ConversationDTO } from "../../dtos/user.dto/chat.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";

export interface IChatService{
 getOrCreateConversation(participants:{userId:string;role:string}[]):Promise<ConversationDTO>
 getUserConversation(userId:string):Promise<IGenericPaginatedResposnse<ConversationDTO>>
}