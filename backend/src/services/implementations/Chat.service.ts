import { IChatService } from "../interface/IChat.service";
import { IConversationRepository } from "../../repositories/interfaces/IConversation.repository";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";

import { ConversationDTO } from "../../dtos/user.dto/chat.dto";
import { ChatMapper } from "../../mappers/chat.mappers";
import { BadRequestError, NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";

export class ChatService implements IChatService{
    constructor(
        private _conversationRepo:IConversationRepository,
        private _userRepo:IUserRepository,
    ){}
    async getOrCreateConversation(participants: { userId: string; role: string; }[]): Promise<ConversationDTO> {
     const[participant1,participant2]=participants;
     if(!Types.ObjectId.isValid(participant1.userId)||!Types.ObjectId.isValid(participant2.userId)){
        throw new BadRequestError(MESSAGES.INVALID_ID_FORMAT)
     }
     if(!participants||participants.length!=2){
        throw new BadRequestError(MESSAGES.TWO_PEOPLE_NEEDED)
     }
     const requestedUser=await this._userRepo.findById(participant1.userId);
     if(!requestedUser){
        throw new NotFoundError(MESSAGES.REQ_USER_NOT_FOUND)
     }
     const receiverUser=await this._userRepo.findById(participant2.userId);
     if(!receiverUser){
        throw new NotFoundError(MESSAGES.RECEIVER_NOT_FOUNS)
     }
     const conversation=await this._conversationRepo.findOrCreateDirectChat(participants);
     const requestedId=participants[0]?.userId||'';
     return ChatMapper.toConversationDto(conversation,requestedId)
    }
    async getUserConversations(userId: string): Promise<ConversationDTO[]> {
       const userExist=await this._userRepo.findById(userId)
       if(!userExist){
         throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
       }
       const conversations=await this._conversationRepo.findAllForUser(userId)
       return conversations.map((conv)=>ChatMapper.toConversationDto(conv,userId))
    }
    
}