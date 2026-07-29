import { IBaseRepository } from "./IBase.repository";
import { IConversation } from "../../types/conversation.type";

export interface IConversationRepository extends IBaseRepository<IConversation> {
    findOrCreateDirectChat(participants: { userId: string; role: string }[]): Promise<IConversation>;
    findAllForUser(userId: string): Promise<IConversation[]>;
    getUnreadCountForUser(userId: string): Promise<number>
}