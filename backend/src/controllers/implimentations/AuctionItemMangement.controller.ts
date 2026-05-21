import { IAuctionItemMangementController } from "../interfaces/IAuctionItemMangement.controller";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { IAuctionItemMangementSevice } from "../../services/interface/IAuctionItemMangement.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class AuctionItemMangementController implements IAuctionItemMangementController{
    constructor(
        private _logger:ILoggerService,
        private _auctionItemService:IAuctionItemMangementSevice
    ){}
    async createAuctionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            this._logger.info('request reached the auction item mangement controller',{
                requestedby:userId
            })
            const result=await this._auctionItemService.createAuction(userId,req.body)
            SuccessResponse(res,MESSAGES.AUCTION_CREATED,result,HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }

}