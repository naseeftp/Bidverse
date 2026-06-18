import { IBaseRepository } from "./IBase.repository";
import { IConversation } from "../../types/conversation.type";

export interface IConversationRepository extends IBaseRepository<IConversation>{
findOrCreateDirectChat(participants: { userId: string; role: string }[]): Promise<IConversation>;
findAllForUser(userId:string):Promise<IConversation[]>;
updateLastMessageData(conversationId:string,messageId:string,snippet:string,timestamp:Date):Promise<void>
incrementUnreadForParticipants(conversationId: string, senderId: string): Promise<void>;
resetUnreadCount(conversationId: string, userId: string): Promise<void>;

}