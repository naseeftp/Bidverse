import { Request,Response,NextFunction } from "express";


export interface IChatController{
    getOrCreateConversation(req:Request,res:Response,next:NextFunction):Promise<void>
}