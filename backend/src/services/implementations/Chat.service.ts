import { IChatService } from "../interface/IChat.service";
import { IConversationRepository } from "../../repositories/interfaces/IConversation.repository";
import { ConversationDTO } from "../../dtos/user.dto/chat.dto";
import { ChatMapper } from "../../mappers/chat.mappers";

export class ChatService implements IChatService{
    constructor(
        private _conversationRepo:IConversationRepository
    ){}
    async getOrCreateConversation(participants: { userId: string; role: string; }[]): Promise<ConversationDTO> {
     const conversation=await this._conversationRepo.findOrCreateDirectChat(participants);
     const requestedId=participants[0]?.userId||'';
     return ChatMapper.toConversationDto(conversation,requestedId)
    }
}