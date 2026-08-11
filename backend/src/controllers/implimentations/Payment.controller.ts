import { Request, Response, NextFunction } from "express";
import { IPaymentService } from "../../services/interface/IPayment.service";
import { IPaymentController } from "../interfaces/IPayment.controller";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class PaymentController implements IPaymentController{
    constructor(
        private _paymentService:IPaymentService
    ){}
    async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data=req.body;
            const result=await this._paymentService.verifyPayment(data)
            SuccessResponse(res,MESSAGES.PAYMENT_SUCCESS,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}