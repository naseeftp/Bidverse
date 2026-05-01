import { Request, Response, NextFunction } from "express";

export interface IprofileController {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>
    changeProfileDetails(req: Request, res: Response, next: NextFunction): Promise<void>
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>
    changeEmail(req:Request,res:Response,next:NextFunction):Promise<void>
    changeEmailVerification(req:Request,res:Response,next:NextFunction):Promise<void>
}
