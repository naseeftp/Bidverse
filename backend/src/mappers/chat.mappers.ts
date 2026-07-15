import { ConversationDTO, ParticipantDTO } from "../dtos/user.dto/chat.dto";
import { IConversation } from "../types/conversation.type";
import { Types } from "mongoose";
import { IMessageDocument } from "../types/message.type";
import { MessageDto } from "../dtos/user.dto/chat.dto";
import { MessageType } from "../constants/constants";

export interface IPopulatedParticipantDoc {
    userId: {
        _id: Types.ObjectId;
        name?: string;
        email?: string;
    };
    role: string
}

export class ChatMapper {
    static toConversationDto(conv: IConversation, currrentUserId?: string): ConversationDTO {
        const unreadMap = conv.unreadCount as Map<string, number>;
        const targetUserId = currrentUserId || '';
        return {
            _id: conv._id.toString(),
            participants: (conv.participants as unknown as IPopulatedParticipantDoc[]).map((p): ParticipantDTO => ({
                userId: p.userId._id.toString(),
                name: p.userId.name || "User",
                email: p.userId.email || "",
                role: p.role
            })),
            lastMessageId: conv.lastMessage ? conv.lastMessage.toString() : null,
            lastMessageSnippet: conv.lastMessageSnippet ?? '',
            lastMessageAt: conv.lastMessageAt,
            unreadCount: unreadMap.get ? (unreadMap.get(targetUserId) || 0) : 0,
            status: conv.status,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt
        }
    }
    static toMessageDocumentToDTO(doc: IMessageDocument): MessageDto {
        return {
            _id: doc._id.toString(),
            conversationId: doc.conversationId.toString(),
            senderId: doc.senderId.toString(),
            senderRole: doc.senderRole,
            content: doc.content || '',
            messageType: doc.messageType as MessageType,
            attachment: doc.attachment ? {
                url: doc.attachment.url,
                fileName: doc.attachment.fileName,
                fileSize: doc.attachment.fileSize,
                mimeType: doc.attachment.mimeType
            } : null,
            isDeletedForEveryone: doc.isDeletedForEveryone,
            readBy: Array.isArray(doc.readBy)
                ? doc.readBy.map(id => id.toString())
                : [],
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        };
    }

}