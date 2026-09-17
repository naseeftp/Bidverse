import { Request, Response, NextFunction } from "express";

export interface IDashboardController {
    getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void>
}