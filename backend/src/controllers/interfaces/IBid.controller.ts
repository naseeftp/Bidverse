import { Request, Response, NextFunction } from "express";

export interface IBidController {
    placdBid(req: Request, res: Response, next: NextFunction): Promise<void>
    getUserBids(req: Request, res: Response, next: NextFunction): Promise<void>
    getBidHistory(req: Request, res: Response, next: NextFunction): Promise<void>
}