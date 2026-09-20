
import { Request, Response, NextFunction } from "express";
export interface IRevenueController {
    getRevenueBreakdown(req: Request, res: Response, next: NextFunction): Promise<void>
    getIncomingRevenueList(req: Request, res: Response, next: NextFunction): Promise<void>
    getTenantRevenueBreakdown(req: Request, res: Response, next: NextFunction): Promise<void>
    getTenantIncomingRevenueList(req: Request, res: Response, next: NextFunction): Promise<void>

}