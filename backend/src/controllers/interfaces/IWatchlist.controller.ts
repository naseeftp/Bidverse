import { Request,Response,NextFunction } from "express";

export interface IWatchlistController{
    addToWatchList(req:Request,res:Response,next:NextFunction):Promise<void>
}