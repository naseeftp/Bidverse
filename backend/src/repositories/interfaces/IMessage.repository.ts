import { IMessageDocument } from "../../types/message.type"
import { IBaseRepository } from "./IBase.repository"

export interface IMessageRepository extends IBaseRepository<IMessageDocument> {
    findMessages(conversationId: string, userId: string): Promise<IMessageDocument[] | null>
    deleteForEveryOne(messageId: string, senderId: string): Promise<IMessageDocument | null>
    editMessage(messageId: string, newContent: string): Promise<IMessageDocument | null>
    deleteForMe(messageId: string, userId: string): Promise<IMessageDocument | null>
}