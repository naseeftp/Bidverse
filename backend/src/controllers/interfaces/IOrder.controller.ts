import { Request, Response, NextFunction } from "express";

export interface IOrderController {
    initiateOrderPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void>;

}