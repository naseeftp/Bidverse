import { IChatService } from "../interface/IChat.service";
import { IConversationRepository } from "../../repositories/interfaces/IConversation.repository";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { ConversationDTO, MessageDto, SendMessageInputDTO } from "../../dtos/user.dto/chat.dto";
import { ChatMapper } from "../../mappers/chat.mappers";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { socketService, SocketService } from "./socket.service";
import { Types } from "mongoose";
import { IMessageRepository } from "../../repositories/interfaces/IMessage.repository";
import { Role } from "../../dtos/Common.dto";

export class ChatService implements IChatService{
    constructor(
        private _conversationRepo:IConversationRepository,
        private _userRepo:IUserRepository,
        private _messageRepo:IMessageRepository
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

    async sendMessage(senderId: string, senderRole:Role, payload: SendMessageInputDTO): Promise<MessageDto> {
       const {conversationId,content}=payload
       const conversation=await this._conversationRepo.findById(conversationId);
       if(!conversation){
         throw new NotFoundError('conversation not found')//change to message constant
       }
       const isParticipant=conversation.participants.some((p)=>p.userId.toString()===senderId)
       if(!isParticipant){
         throw new UnauthorizedError('Not memeber of this conversation')
       }
       const newMessage=await this._messageRepo.create({
         conversationId:new Types.ObjectId(conversationId),
          senderId:new Types.ObjectId(senderId),
          senderRole,
          content:content?.trim()

       });
       const mappedMessage=ChatMapper.toMessageDocumentToDTO(newMessage)
       // add logic to update last message snippet in db
       const senderSocketId=socketService.getUserSocketId(senderId)
       if(senderSocketId){
         socketService.emitToRoomExcluding(conversationId,senderSocketId,'message:receive',newMessage)
       }
       //add event logic to update the side bar logic to update the snippet
       return mappedMessage
    }
    
}