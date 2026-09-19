import { IRevenueController } from "../interfaces/IRevenue.controller";
import { IRevenueService } from "../../services/interface/IRevenue.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class RevenueController implements IRevenueController {
    constructor(
        private _revenueService: IRevenueService
    ) { }
    async getRevenueBreakdown(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const granularity = req.query.granularity as "day" | "week" | "month";
            const result = await this._revenueService.getRevenueBreakdown(startDate, endDate, granularity ?? 'day')
            SuccessResponse(res,MESSAGES.ACTION_SUCCESS,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async getIncomingRevenueList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const result=await this._revenueService.getIncomingRevenueList(startDate,endDate,page,limit);
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}