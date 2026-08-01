import { IChatController } from "../interfaces/IChat.controller";
import { IChatService } from "../../services/interface/IChat.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { Role } from "../../dtos/Common.dto";
import { ICloudinaryService } from "../../services/interface/ICloudinary.service";
import { BadRequestError } from "../../errors/AppError";


export class ChatController implements IChatController {
    constructor(
        private _ChatService: IChatService,
        private _cloudinaryService:ICloudinaryService
    ) { }

    async getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const currentUserId = req.user.id;
            const currentUserRole = req.user.role;
            const { receiverId, receiverRole } = req.body;
            const participants = [
                { userId: currentUserId, role: currentUserRole },
                { userId: receiverId, role: receiverRole }
            ]
            const result = await this._ChatService.getOrCreateConversation(participants)
            SuccessResponse(res, MESSAGES.CONV_CREATED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async getUserConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const result = await this._ChatService.getUserConversations(userId);
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const senderId = req.user.id;
            const senderRole = req.user.role as Role;
            const payload = req.body;
            const result = await this._ChatService.sendMessage(senderId, senderRole, payload)
            SuccessResponse(res, 'message sended', result, HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversationId = req.params.id as string;
            const userId = req.user.id
            const response = await this._ChatService.getMessages(conversationId, userId)
            SuccessResponse(res, 'messages retrieved', response, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async deleteForEveryOne(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const senderId = req.user.id;
            const messageId = req.params.id as string;
            const result = await this._ChatService.deleteForEveryOne(messageId, senderId)
            SuccessResponse(res, MESSAGES.MESSAGE_DELETED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async editMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const senderId = req.user.id;
            const messageId = req.params.id as string;
            const { content } = req.body;
            const result = await this._ChatService.editMessage(messageId, senderId, content)
            SuccessResponse(res, MESSAGES.MESSAGE_EDITED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async deleteForMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const messageId = req.params.id as string;
            const userId = req.user.id;
            const result = await this._ChatService.deleteForMe(messageId, userId);
            SuccessResponse(res, MESSAGES.MESSAGE_DELETED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async markMessageRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const conversationId = req.params.id as string;
            const userId = req.user.id;
            const result = await this._ChatService.markMessageRead(conversationId, userId)
            SuccessResponse(res, MESSAGES.MESSAGE_READED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async getUnreadCountForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const result = await this._ChatService.getUnreadCountForUser(userId)
            SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async UploadAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const file = (req as Request & { file?: { buffer: Buffer } }).file;
        if(!file){
            return
        }
        const audioData=await this._cloudinaryService.UploadAudio(file.buffer)
        SuccessResponse(res, MESSAGES.ACTION_SUCCESS, audioData, HttpStatus.OK);
      } catch (error) {
        next(error)
      }  
    }
    async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
        const file = (req as Request & { file?: { buffer: Buffer } }).file;
        if (!file) {
            throw new BadRequestError('No image file provided')
        }

        const imageData = await this._cloudinaryService.UploadImage(file.buffer);
        SuccessResponse(res, MESSAGES.ACTION_SUCCESS, imageData, HttpStatus.OK);
      } catch (error) {
        next(error)
      }  
    }
}