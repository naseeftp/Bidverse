import { Request, Response, NextFunction } from "express"

export interface IliveController {
    findLiveState(req: Request, res: Response, next: NextFunction): Promise<void>
    joinRoom(req: Request, res: Response, next: NextFunction): Promise<void>
    startLive(req: Request, res: Response, next: NextFunction): Promise<void>
    placeBid(req: Request, res: Response, next: NextFunction): Promise<void>
    pauseLive(req: Request, res: Response, next: NextFunction): Promise<void>
    resumeLive(req:Request,res:Response,next:NextFunction):Promise<void>
}