import { IMessageDocument } from "../../types/message.type"
import { IBaseRepository } from "./IBase.repository"

export interface IMessageRepository extends IBaseRepository<IMessageDocument> {
    deleteForEveryOne(messageId: string, senderId: string): Promise<IMessageDocument | null>
    editMessage(messageId: string, newContent: string): Promise<IMessageDocument | null>

}