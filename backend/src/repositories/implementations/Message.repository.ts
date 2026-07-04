import { IMessageRepository } from "../interfaces/IMessage.repository";
import { Message } from "../../models/message.model";
import { IMessageDocument } from "../../types/message.type";
import { BaseRepository } from "./Base.repository";
import  { Types } from "mongoose";


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(Message)
    }
    
}