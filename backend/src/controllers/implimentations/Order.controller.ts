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
     async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            const page=Number(req.query.page);
            const limit=Number(req.query.limit);
            const status=req.query.status as string;
            const search=req.query.search as string
            const result=await this._orderService.getUserOrders(userId,page,limit,status,search)
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
           next(error) 
        }
    }
}