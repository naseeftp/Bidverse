import { Types } from "mongoose";
import { Notification } from "../../models/notification.model";
import { INotificationDocument } from "../../types/notification.type";
import { INotificationRepository } from "../interfaces/INotificationRepository";
import { BaseRepository } from "./Base.repository";

export class NotificationRepository extends BaseRepository<INotificationDocument> implements INotificationRepository{
    constructor(){
        super(Notification)
    }
    async findAllNotificationForUser(userId: string): Promise<INotificationDocument[]> {
        const targetedObjectId=new Types.ObjectId(userId);
        return await this.model.find({
            recipientId:targetedObjectId
        })
    }
    async markAllRead(userId:string):Promise<INotificationDocument[]>{
        const targetedObjectId=new Types.ObjectId(userId)
        await this.model.updateMany(
            {recipientId:targetedObjectId,isRead:false},
            {
                $set:{
                    isRead:true,
                    readAt:new Date
                }
            }
        )
        return this.model.find({recipientId:targetedObjectId})
    }
    
}