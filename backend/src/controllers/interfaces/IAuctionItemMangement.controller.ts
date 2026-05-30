import { Request,Response,NextFunction } from "express";

export interface IAuctionItemMangementController{
    createAuctionItem(req:Request,res:Response,next:NextFunction):Promise<void>
    getAllAuctionByAdmin(req:Request,res:Response,next:NextFunction):Promise<void>
    getTenantAuctions(req:Request,res:Response,next:NextFunction):Promise<void>
}