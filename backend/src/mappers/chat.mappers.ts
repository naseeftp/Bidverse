import { ConversationDTO,ParticipantDTO} from "../dtos/user.dto/chat.dto";
import { IConversation } from "../types/conversation.type";
import { Types } from "mongoose";

export interface IPopulatedParticipantDoc{
    userId:{
        _id:Types.ObjectId;
        name?:string;
        email?:string;
    };
    role:string
}

export class ChatMapper{
static toConversationDto(conv:IConversation,currrentUserId?:string):ConversationDTO{
    const unreadMap=conv.unreadCount as Map<string,number>;
    const  targetUserId=currrentUserId||'';
    return{
        _id:conv._id.toString(),
        participants: (conv.participants as unknown as IPopulatedParticipantDoc[]).map((p): ParticipantDTO => ({
                userId: p.userId._id.toString(),
                name: p.userId.name || "User",
                email: p.userId.email || "",
                role: p.role
        })),
        lastMessageId:conv.lastMessage?conv.lastMessage.toString():null,
        lastMessageSnippet:conv.lastMessageSnippet??'',
        lastMessageAt:conv.lastMessageAt,
        unreadCount:unreadMap.get?(unreadMap.get(targetUserId)||0):0,
        status:conv.status,
        createdAt:conv.createdAt,
        updatedAt:conv.updatedAt
    }
}

}