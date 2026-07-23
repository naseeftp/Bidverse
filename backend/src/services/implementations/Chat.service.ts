import { IChatService } from "../interface/IChat.service";
import { IConversationRepository } from "../../repositories/interfaces/IConversation.repository";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { ConversationDTO, MessageDto, SendMessageInputDTO } from "../../dtos/user.dto/chat.dto";
import { ChatMapper } from "../../mappers/chat.mappers";
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";
import { IMessageRepository } from "../../repositories/interfaces/IMessage.repository";
import { Role } from "../../dtos/Common.dto";
import { socketService } from "./socket.service";
import { MESSAGE_TIME_CONFIG } from "../../constants/constants";

export class ChatService implements IChatService {
  constructor(
    private _conversationRepo: IConversationRepository,
    private _userRepo: IUserRepository,
    private _messageRepo: IMessageRepository
  ) { }

  async getOrCreateConversation(participants: { userId: string; role: string; }[]): Promise<ConversationDTO> {
    const [participant1, participant2] = participants;
    if (!Types.ObjectId.isValid(participant1.userId) || !Types.ObjectId.isValid(participant2.userId)) {
      throw new BadRequestError(MESSAGES.INVALID_ID_FORMAT)
    }
    if (!participants || participants.length != 2) {
      throw new BadRequestError(MESSAGES.TWO_PEOPLE_NEEDED)
    }
    const requestedUser = await this._userRepo.findById(participant1.userId);
    if (!requestedUser) {
      throw new NotFoundError(MESSAGES.REQ_USER_NOT_FOUND)
    }
    const receiverUser = await this._userRepo.findById(participant2.userId);
    if (!receiverUser) {
      throw new NotFoundError(MESSAGES.RECEIVER_NOT_FOUNS)
    }
    const conversation = await this._conversationRepo.findOrCreateDirectChat(participants);
    const requestedId = participants[0]?.userId || '';
    return ChatMapper.toConversationDto(conversation, requestedId)
  }
  async getUserConversations(userId: string): Promise<ConversationDTO[]> {
    const userExist = await this._userRepo.findById(userId)
    if (!userExist) {
      throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
    }
    const conversations = await this._conversationRepo.findAllForUser(userId)
    return conversations.map((conv) => ChatMapper.toConversationDto(conv, userId))
  }

  async sendMessage(senderId: string, senderRole: Role, payload: SendMessageInputDTO): Promise<MessageDto> {
    const { conversationId, content } = payload
    const conversation = await this._conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError(MESSAGES.CONV_NOT_FOUND)
    }
    const isParticipant = conversation.participants.some((p) => p.userId.toString() === senderId)
    if (!isParticipant) {
      throw new UnauthorizedError('Not memeber of this conversation')
    }
    const newMessage = await this._messageRepo.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      senderRole,
      content: content?.trim()

    });
    const now = new Date()
    const updatingData = {
      _id: conversationId, lastMessageSnippet: content?.trim(), lastMessage: senderId, lastMessageAt: now
    }
    await conversation.updateOne(updatingData)
    const mappedMessage = ChatMapper.toMessageDocumentToDTO(newMessage)
    socketService.emitToRoom(conversationId, 'message:receive', mappedMessage)
    socketService.emitToRoom(conversationId, 'conversation:updated', {
      conversationId,
      lastMessageSnippet: mappedMessage.content,
      lastMessageAt: now.toISOString()
    })
    return mappedMessage
  }

  async getMessages(conversationId: string): Promise<MessageDto[]> {
    const isConversationExist = await this._conversationRepo.findById(conversationId);
    if (!isConversationExist) {
      throw new NotFoundError(MESSAGES.CONV_NOT_FOUND)
    }
    const messages = await this._messageRepo.findAll({ conversationId: conversationId })
    if (!messages) {
      throw new NotFoundError('Messages not found')
    }
    const mappedMessages: MessageDto[] = messages.map((message) =>
      ChatMapper.toMessageDocumentToDTO(message)
    )
    return mappedMessages
  }
  async deleteForEveryOne(messageId: string, senderId: string): Promise<MessageDto> {
    const isMessageExist = await this._messageRepo.findById(messageId);
    if (!isMessageExist) {
      throw new NotFoundError(MESSAGES.MESSAGE_NOT_FOUND)
    }
    if (isMessageExist.senderId.toString() !== senderId) {
      throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
    }
    const MessageAge = Date.now() - new Date(isMessageExist.createdAt).getTime();
    if (MessageAge > MESSAGE_TIME_CONFIG.MAX_DELETE_WINDOW) {
      throw new AppError("Time limit exceeded: You can only delete messages for everyone within 15 minutes.")
    }
    const updatedMessage = await this._messageRepo.deleteForEveryOne(messageId, senderId)
    if (!updatedMessage) {
      throw new NotFoundError('Failed to delete message or message was already deleted')
    }

    const mappedMessage = ChatMapper.toMessageDocumentToDTO(updatedMessage)
    socketService.emitToRoom(
      mappedMessage.conversationId.toString(),
      'message:deleted',
      {
        conversationId: mappedMessage.conversationId.toString(),
        messageId: mappedMessage._id.toString(),
        isDeletedForEveryone: true
      }
    )
    return mappedMessage

  }

  async editMessage(messageId: string, senderId: string, newContent: string): Promise<MessageDto> {
    const isMessageExist = await this._messageRepo.findById(messageId);
    if (!isMessageExist) {
      throw new NotFoundError(MESSAGES.MESSAGE_NOT_FOUND)
    };
    if (isMessageExist.senderId.toString() !== senderId) {
      throw new UnauthorizedError(MESSAGES.NOT_PERMITTED)
    }
    const messageAge = Date.now() - new Date(isMessageExist.createdAt).getTime();
    if (messageAge >= MESSAGE_TIME_CONFIG.MAX_EDIT_WINDOW) {
      throw new AppError("Time limit exceeded: You can only Edit messages for everyone within 15 minutes.")
    }
    const updatedMessage = await this._messageRepo.editMessage(messageId, newContent);
    if (!updatedMessage) {
      throw new NotFoundError('Failed to edit message')
    }
    const mappedMessage = ChatMapper.toMessageDocumentToDTO(updatedMessage)
    return mappedMessage
  }


}