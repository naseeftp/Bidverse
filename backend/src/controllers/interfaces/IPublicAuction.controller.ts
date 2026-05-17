import { Request,Response,NextFunction } from "express";


export interface IPublicAuctionController{
    listAllPublicAuctionHouses(req:Request,res:Response,next:NextFunction):Promise<void>
}