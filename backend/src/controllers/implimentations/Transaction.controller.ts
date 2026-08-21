import { ITransactionController } from "../interfaces/ITransaction.controller";
import { ITransactionService } from "../../services/interface/ITransaction.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
import { TransactionDirection } from "../../constants/transaction.constant";

export class TransactionController implements ITransactionController {
    constructor(
        private _transactionService: ITransactionService
    ) { }
    async listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const direction=req.query.direction as TransactionDirection
            const result = await this._transactionService.listTransactons(userId, page, limit,direction);
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}