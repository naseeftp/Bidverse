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
    async getAllAuctionByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||10;
            const search=req.query.search as string;
            const status=req.query.status as string;
            const type=req.query.type as string
            this._logger.info('fetching the auctions items for',{
                page:page,
                search:search,
                status:status,
                limit:limit,
                type:type
            })
            const result=await this._auctionItemService.listAdminAuctions(page,limit,search,status,type)
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

}