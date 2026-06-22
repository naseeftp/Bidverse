export const MessageType = {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file'
} as const;
export type MessageType = typeof MessageType[keyof typeof MessageType];

export interface ParticipantDTO{
    userId:string;
    name:string;
    email:string;
    role:string;
}
export interface AttachmentDTO{
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string
}

export interface ConversationDTO{
    _id:string;
    participants:ParticipantDTO[];
    lastMessageId:string|null;
    lastMessageSnippet:string;
    lastMessageAt:Date;
    unreadCount:number;
    status:'active'|'closed';
    createdAt?:Date;
    updatedAt?:Date;
}

export interface MessageDto {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: string;
    content: string;
    attachment: AttachmentDTO | null;
    messageType:MessageType;
    readBy: string[];
    isDeletedForEveryone: boolean;
    createdAt?: Date;
}
