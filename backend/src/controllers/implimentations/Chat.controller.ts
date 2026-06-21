import { IChatController } from "../interfaces/IChat.controller";
import { IChatService } from "../../services/interface/IChat.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";


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
}