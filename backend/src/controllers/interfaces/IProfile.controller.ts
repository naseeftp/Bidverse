import { Request, Response, NextFunction } from "express";

export interface IprofileController {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>
}
