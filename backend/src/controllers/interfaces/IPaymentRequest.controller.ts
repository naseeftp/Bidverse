import { Request, Response, NextFunction } from "express"

export interface IPaymentRequestController {
    getUserPaymentRequests(req: Request, res: Response, next: NextFunction): Promise<void>
}