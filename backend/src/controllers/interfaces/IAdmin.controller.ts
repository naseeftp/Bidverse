import { Request,Response,NextFunction } from "express";

export interface IAdminController{
    getAuctionHouses(req:Request,res:Response,next:NextFunction):Promise<void>
}