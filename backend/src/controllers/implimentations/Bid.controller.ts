import { IBidController } from "../interfaces/IBid.controller";
import { IBidService } from "../../services/interface/IBid.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class BidController implements IBidController {
  constructor(
    private _bidService: IBidService
  ) { }
  async placdBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const result = await this._bidService.placceBid(userId, req.body)
      SuccessResponse(res, MESSAGES.BID_PLACED, result, HttpStatus.OK)
    } catch (error) {
      next(error)
    }
  }
  async getUserBids(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const status = req.query.status as string;
      const search = req.query.search as string;
      const result = await this._bidService.getUserBids(userId, page, limit, status, search)
      SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
    } catch (error) {
      next(error)
    }
  }
  async getBidHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auctionId = req.params.id as string;
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const result = await this._bidService.getBidHistory(auctionId, page, limit)
      SuccessResponse(res, MESSAGES.ACTION_SUCCESS, result, HttpStatus.OK)
    } catch (error) {
      next(error)
    }
  }
}