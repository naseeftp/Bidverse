import { Request, Response, NextFunction } from "express";


export interface IChatController {
    getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void>
    getUserConversations(req: Request, res: Response, next: NextFunction): Promise<void>
    sendMessage(req: Request, res: Response, next: NextFunction): Promise<void>;
    getMessages(req: Request, res: Response, next: NextFunction): Promise<void>;
}