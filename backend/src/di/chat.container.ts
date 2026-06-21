import { ConversationRepository } from "../repositories/implementations/Conversation.repository";
import { UserRepository } from "../repositories/implementations/User.repository";
import { ChatService } from "../services/implementations/Chat.service";
import { ChatController } from "../controllers/implimentations/Chat.controller";


const convRepo=new ConversationRepository();
const userRepo=new UserRepository();
const chatService=new ChatService(convRepo,userRepo);
export const chatController=new ChatController(chatService)