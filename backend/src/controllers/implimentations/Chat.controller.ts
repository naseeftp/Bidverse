import { IChatController } from "../interfaces/IChat.controller";
import { IChatService } from "../../services/interface/IChat.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { Role } from "../../dtos/Common.dto";

export class ChatController implements IChatController{
    constructor(
        private _ChatService:IChatService
    ){}

    async getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId=req.user.id;
            const currentUserRole=req.user.role;
            const {receiverId,receiverRole}=req.body;
            const participants=[
                {userId:currentUserId,role:currentUserRole},
                {userId:receiverId,role:receiverRole}
            ]
            const result=await this._ChatService.getOrCreateConversation(participants)
            SuccessResponse(res,MESSAGES.CONV_CREATED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async getUserConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            const result=await this._ChatService.getUserConversations(userId);
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const senderId=req.user.id;
            const senderRole=req.user.role as Role;
            const payload=req.body;
            const result=await this._ChatService.sendMessage(senderId,senderRole,payload)
            SuccessResponse(res,'message sended',result,HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversationId=req.params.id as string;
            const response=await this._ChatService.getMessages(conversationId)
            SuccessResponse(res,'messages retrieved',response,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}