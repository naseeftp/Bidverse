import { Request,Response,NextFunction } from "express";

export interface IPaymentController{
    verifyPayment(req:Request,res:Response,next:NextFunction):Promise<void>
}