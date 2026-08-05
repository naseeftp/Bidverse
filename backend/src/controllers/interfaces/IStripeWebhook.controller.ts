import { Request,Response,NextFunction } from "express";

export interface IStripeWebHookController{
    handleStripeWebhook(req:Request,res:Response,next:NextFunction):Promise<void>
}