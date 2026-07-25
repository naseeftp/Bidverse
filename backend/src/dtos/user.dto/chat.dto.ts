import { MessageType } from "../../constants/constants";

export interface ParticipantDTO {
    userId: string;
    name: string;
    email: string;
    role: string;
}
export interface AttachmentDTO {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string
}
export interface SendMessageInputDTO {
    conversationId: string;
    content?: string;
    attachement?: AttachmentDTO | null;
    messageType?: MessageType
}

export interface ConversationDTO {
    _id: string;
    participants: ParticipantDTO[];
    lastMessageId: string | null;
    lastMessageSnippet: string;
    lastMessageAt: Date;
    unreadCount: number;
    status: 'active' | 'closed';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MessageDto {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    attachment: AttachmentDTO | null;
    messageType: MessageType;
    readBy: string[];
    isDeletedForEveryone: boolean;
    createdAt?: Date;
}

export interface MarkReadResponseDTO
{
    conversationId:string;
    readerId:string;
    updatedMessageIds:string[]
}