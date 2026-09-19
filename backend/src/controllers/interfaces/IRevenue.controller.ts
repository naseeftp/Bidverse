
import { Request,Response,NextFunction } from "express";
export interface IRevenueController{
getRevenueBreakdown(req:Request,res:Response,next:NextFunction):Promise<void>
getIncomingRevenueList(req:Request,res:Response,next:NextFunction):Promise<void>

}