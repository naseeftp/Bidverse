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
      // const { data } = req.body;
      const result = await this._bidService.placceBid(userId, req.body)
      SuccessResponse(res, MESSAGES.BID_PLACED, result, HttpStatus.OK)
    } catch (error) {
      next(error)
    }
  }
}