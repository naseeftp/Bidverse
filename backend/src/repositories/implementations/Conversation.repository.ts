import { IConversation } from "../../types/conversation.type";
import { IConversationRepository } from "../interfaces/IConversation.repository";
import { BaseRepository } from "./Base.repository";
import { Conversation } from '../../models/conversation.model'
import { Types } from "mongoose";

export class ConversationRepository extends BaseRepository<IConversation> implements IConversationRepository {
    constructor() {
        super(Conversation)
    }
    async findOrCreateDirectChat(participants: { userId: string; role: string }[]): Promise<IConversation> {
        const targetUserIds = participants.map(p => new Types.ObjectId(p.userId)).sort();
        let conversation = await this.model.findOne({
            'participants.userId': { $all: targetUserIds },
            participants: { $size: targetUserIds.length }
        }).populate('participants.userId').exec()
        if (!conversation) {
            const preparedParticipants = participants.map(p => ({
                userId: new Types.ObjectId(p.userId),
                role: p.role
            }))
            const initialUnreadCount = new Map<string, number>()
            participants.forEach(p => initialUnreadCount.set(p.userId, 0));
            const newConversation = await this.model.create({
                participants: preparedParticipants,
                unreadCount: initialUnreadCount,
                status: 'active',
                lastMessageSnippet: ''
            })
            //Mongoose .create() doesn't support inline chaining, so we populate the instance afterwards
            conversation = await newConversation.populate('participants.userId');
        }
        return conversation
    }
    async findAllForUser(userId: string): Promise<IConversation[]> {
        const userObjectId = new Types.ObjectId(userId);
        return await this.model.find({ 'participants.userId': userObjectId })
            .populate('participants.userId')
            // .populate('lastMessage')
            .exec() as IConversation[]
    }




}