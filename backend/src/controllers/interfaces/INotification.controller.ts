import { Request, Response, NextFunction } from "express"
export interface INotificationController {
    findAllNotificationForUser(req: Request, res: Response, next: NextFunction): Promise<void>
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>
    markAllRead(req: Request, res: Response, next: NextFunction): Promise<void>
}