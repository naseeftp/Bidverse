import { IMessageRepository } from "../interfaces/IMessage.repository";
import { Message } from "../../models/message.model";
import { IMessageDocument } from "../../types/message.type";
import { BaseRepository } from "./Base.repository";


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(Message)
    }
    async findMessage(messageId:string):Promise<IMessageDocument|null>{
        return this.model.findById(messageId)// temp method for fixing lint warning
    }
   
}