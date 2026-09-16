import { Request, Response, NextFunction } from "express";

export interface IOrderController {
    initiateOrderPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTenantOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllOrdersByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsConfirmed(req: Request, res: Response, next: NextFunction): Promise<void>;
    requestReturn(req: Request, res: Response, next: NextFunction): Promise<void>;
    reviewReturn(req: Request, res: Response, next: NextFunction): Promise<void>
}