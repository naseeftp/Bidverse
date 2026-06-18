import { IConversation } from "../../types/conversation.type";
import { IConversationRepository } from "../interfaces/IConversation.repository";
import { BaseRepository } from "./Base.repository";
import {Conversation} from '../../models/conversation.model'
import { Types } from "mongoose";

export class ConversationRepository extends BaseRepository<IConversation> implements IConversationRepository{
    constructor(){
        super(Conversation)
    }
    async findOrCreateDirectChat(participants: { userId: string; role: string }[]): Promise<IConversation>{
        const targetUserIds= participants.map(p=>new Types.ObjectId(p.userId)).sort();
        let conversation=await this.model.findOne({
            'participants.userId':{$all:targetUserIds},
             participants:{$size:targetUserIds.length}
        }).exec()
        if(!conversation){
            const preparedParticipants=participants.map(p=>({
                userId:new Types.ObjectId(p.userId),
                role:p.role
            }))
            const initialUnreadCount=new Map<string,number>()
            participants.forEach(p => initialUnreadCount.set(p.userId, 0));
            conversation=await this.model.create({
                participants:preparedParticipants,
                unreadCount:initialUnreadCount,
                status:'active',
                lastMessageSnippet:''
            })
        }
        return conversation
    }
    async findAllForUser(userId:string):Promise<IConversation[]>{
        const userObjectId=new Types.ObjectId(userId);
        return await this.model.find({'participants.userId':userObjectId})
        .populate('lastMessage')
        .exec() as IConversation[]
    }
    async updateLastMessageData(conversationId:string,messageId:string,snippet:string,timestamp:Date):Promise<void>{
       await this.model.findByIdAndUpdate(conversationId,{
        $set:{
            lastMessage:new Types.ObjectId(messageId),
            lastMessageSnippet:snippet,
            lastMessageAt:timestamp
        }
       }).exec()
    }
    async incrementUnreadForParticipants(conversationId: string, senderId: string): Promise<void>{
      const conversation=await this.model.findById(conversationId);
      if(!conversation) return;
      const updatFileds:Record<string,number>={}
      conversation.participants.forEach(p=>{
        const PId=p.userId.toString();
        if(PId!==senderId){
            updatFileds[`unreadCount.${PId}`]=1;
        }
      });
      if(Object.keys(updatFileds).length>0){
        await this.model.findByIdAndUpdate(conversationId,{
           $inc:updatFileds
        }).exec()
      }

    }

    async resetUnreadCount(conversationId: string, userId: string): Promise<void>{
        const updateKey=`unreadCount.${userId}`;//computed property name
        await this.model.findByIdAndUpdate(conversationId,{
            $set:{[updateKey]:0} // if we dirctly use updatekey porperty name key name will store as update key not the actual value thats why we use in array
        }).exec()
    }


}