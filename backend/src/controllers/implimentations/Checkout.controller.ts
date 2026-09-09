import { Request, Response, NextFunction } from "express";
import { ICheckoutService } from "../../services/interface/ICheckout.service";
import { IChekoutController } from "../interfaces/ICheckout.controller";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class CheckoutController implements IChekoutController {
    constructor(
        private _checkoutService: ICheckoutService
    ) { }
    async getCheckOutDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const buyerId = req.user.id;
            const paymentRequestId = req.params.id as string;
            const result = await this._checkoutService.getCheckoutDetails(paymentRequestId, buyerId);
            SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}