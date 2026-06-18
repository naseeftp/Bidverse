import { IMessageDocument } from "../../types/message.type"
import { IBaseRepository } from "./IBase.repository"

export interface IMessageRepository extends IBaseRepository<IMessageDocument> {
    findByConversationId(conversationId: string, userId: string): Promise<IMessageDocument[]>
    markReadByConversation(conversationId: string, userId: string): Promise<void>
    findLLastMessageByConversationId(conversationId: string): Promise<IMessageDocument>
    softDeleteForUser(messageId: string, userId: string): Promise<IMessageDocument | null>
    softDeleteForEveryOne(messageId: string): Promise<IMessageDocument | null>;

}