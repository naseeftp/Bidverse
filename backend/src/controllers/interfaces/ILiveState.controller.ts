import { Request,Response,NextFunction } from "express"

export interface IliveController{
    findLiveState(req:Request,res:Response,next:NextFunction):Promise<void>
}