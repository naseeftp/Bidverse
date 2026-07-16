import { IMessageDocument } from "../../types/message.type"
import { IBaseRepository } from "./IBase.repository"

export interface IMessageRepository extends IBaseRepository<IMessageDocument> {
findMessage(messageId:string):Promise<IMessageDocument|null>

}