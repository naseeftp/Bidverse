import { IMessageRepository } from "../interfaces/IMessage.repository";
import { Message } from "../../models/message.model";
import { IMessageDocument } from "../../types/message.type";
import { BaseRepository } from "./Base.repository";
import { Types } from "mongoose";


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(Message)
    }
    async findMessages(conversationId: string, userId: string): Promise<IMessageDocument[] | null> {
        const userObjectId=new Types.ObjectId(userId);
        return this.model.find(
            {
                conversationId:new Types.ObjectId(conversationId),
                deletedFor:{$ne:userObjectId},
                isDeletedForEveryone:{$ne:true}
            }
        ).exec()

    }

    async deleteForEveryOne(messageId: string, senderId: string): Promise<IMessageDocument | null> {
        return this.model.findOneAndUpdate(
            {
                _id: new Types.ObjectId(messageId),
                senderId: new Types.ObjectId(senderId),
                isDeletedForEveryone: false
            }, {
            $set: {
                isDeletedForEveryone: true,
                content: 'this content was deleted',
                attachment: null
            }
        }, { new: true }
        ).exec()
    }
    async editMessage(messageId: string, newContent: string): Promise<IMessageDocument | null> {
        return this.model.findByIdAndUpdate(messageId, {
            $set: {
                content: newContent.trim()
            }
        }, { new: true }).exec()
    }
    async deleteForMe(messageId: string, userId: string): Promise<IMessageDocument | null> {
        return this.model.findByIdAndUpdate(
            messageId,
            {
                $addToSet: {
                    deletedFor: new Types.ObjectId(userId)
                }
            }, { new: true }
        ).exec()
    }



}