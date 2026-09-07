import { HttpStatus, MESSAGES } from "../../constants/constants";
import { IPaymentRequestService } from "../../services/interface/IPaymentRequest.service";
import { SuccessResponse } from "../../utils/response.utility";
import { IPaymentRequestController } from "../interfaces/IPaymentRequest.controller";
import { Request, Response, NextFunction } from "express";

export class PaymentRequestController implements IPaymentRequestController {
    constructor(
        private _paymentRequestService: IPaymentRequestService
    ) { }
    async getUserPaymentRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const status = req.query.status as string;
            const result = await this._paymentRequestService.getUserPaymentRequests(userId, page, limit, status)
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}