import { ConversationRepository } from "../repositories/implementations/Conversation.repository";
import { UserRepository } from "../repositories/implementations/User.repository";
import { ChatService } from "../services/implementations/Chat.service";
import { ChatController } from "../controllers/implimentations/Chat.controller";
import { MessageRepository } from "../repositories/implementations/Message.repository";

const convRepo = new ConversationRepository();
const userRepo = new UserRepository();
const messageRepo = new MessageRepository()
const chatService = new ChatService(convRepo, userRepo, messageRepo);
export const chatController = new ChatController(chatService)