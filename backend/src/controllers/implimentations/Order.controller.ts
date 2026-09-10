import { Request, Response, NextFunction } from "express";
import { IOrderController } from "../interfaces/IOrder.controller";
import { IOrderService } from "../../services/interface/IOrder.service";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";


export class OrderController implements IOrderController {
    constructor(
        private _orderService:IOrderService
    ){}
    async initiateOrderPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const buyerId=req.user.id;
            const data=req.body;
            const result=await this._orderService.initiateOrderPayment(buyerId,data);
            SuccessResponse(res,MESSAGES.ORDER_PLACED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}