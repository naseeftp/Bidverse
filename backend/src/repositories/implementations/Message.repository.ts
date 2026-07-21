import { IMessageRepository } from "../interfaces/IMessage.repository";
import { Message } from "../../models/message.model";
import { IMessageDocument } from "../../types/message.type";
import { BaseRepository } from "./Base.repository";
import { Types } from "mongoose";


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(Message)
    }
    async deleteForEveryOne(messageId:string,senderId:string):Promise<IMessageDocument|null>{
        return this.model.findOneAndUpdate(
            {
                _id:new Types.ObjectId(messageId),
                senderId:new Types.ObjectId(senderId),
                isDeletedForEveryone:false
            },{
                $set:{
                    isDeletedForEveryone:true,
                    content:'this content was deleted',
                    attachment:null
                }
            },{new:true}
        ).exec()
    }
}