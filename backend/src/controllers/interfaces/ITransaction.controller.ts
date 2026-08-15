import { Request, Response, NextFunction } from "express";
export interface ITransactionController {
    listTransactions(req: Request, res: Response, next: NextFunction): Promise<void>
}