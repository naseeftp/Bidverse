import { IMessageRepository } from "../interfaces/IMessage.repository";
import { Message } from "../../models/message.model";
import { IMessageDocument } from "../../types/message.type";
import { BaseRepository } from "./Base.repository";
import  { Types } from "mongoose";


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(Message)
    }
    async findByConversationId(conversationId: string, userId: string): Promise<IMessageDocument[]> {
        const query: Record<string, unknown> = {
            conversationId: new Types.ObjectId(conversationId),
            deletedFor: { $ne: new Types.ObjectId(userId) }
        }
        const result = await this.model.find(query)
            .sort({ createdAt: -1 })
            .lean() as IMessageDocument[]
        return result
    }
    async markReadByConversation(conversationId: string, userId: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        const query: Record<string, unknown> = {
            conversationId: new Types.ObjectId(conversationId),
            senderId: { $ne: userObjectId },
            readBy: { $ne: userObjectId }
        }
        await this.model.updateMany(query,
            {
                $addToSet: { readBy: userObjectId }
            }
        ).exec()
    }
    async findLLastMessageByConversationId(conversationId: string): Promise<IMessageDocument>{
       const query:Record<string,unknown>={
        conversationId:new Types.ObjectId(conversationId),
        isDeletedForEveryone:false
       }
       return await this.model.findOne( query )
       .sort({createdAt:-1}).lean() as IMessageDocument;
    }
    
    async softDeleteForUser(messageId: string, userId: string): Promise<IMessageDocument | null>{
      return await this.model.findByIdAndUpdate(
        messageId,
        {$addToSet:{deletedFor:new Types.ObjectId(userId)}},
        {new:true}
      ).exec()
    }
    async softDeleteForEveryOne(messageId: string): Promise<IMessageDocument | null>{
       return await this.model.findByIdAndUpdate(
        messageId,
        {$set:{isDeletedForEveryone:true}},
        {new:true}
       ).exec()
    }
    
}