import { IAuctionItemMangementController } from "../interfaces/IAuctionItemMangement.controller";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { IAuctionItemMangementSevice } from "../../services/interface/IAuctionItemMangement.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class AuctionItemMangementController implements IAuctionItemMangementController {
    constructor(
        private _logger: ILoggerService,
        private _auctionItemService: IAuctionItemMangementSevice
    ) { }
    async createAuctionItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            this._logger.info('request reached the auction item mangement controller', {
                requestedby: userId
            })
            const result = await this._auctionItemService.createAuction(userId, req.body)
            SuccessResponse(res, MESSAGES.AUCTION_CREATED, result, HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async getAllAuctionByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search as string;
            const status = req.query.status as string;
            const type = req.query.type as string
            this._logger.info('fetching the auctions items for', {
                page: page,
                search: search,
                status: status,
                limit: limit,
                type: type
            })
            const result = await this._auctionItemService.listAdminAuctions(page, limit, search, status, type)
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async getTenantAuctions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page)
            const limit = Number(req.query.limit)
            const search = req.query.search as string;
            const status = req.query.status as string;
            const type = req.query.type as string;
            const userId = req.user.id;
            this._logger.info('fetching auctions of auctionhouse', {
                page: page,
                search: search,
                status: status,
                limit: limit,
                type: type,
                userId: userId
            })
            const result = await this._auctionItemService.listTenantAuctions(page, limit, search, status, type, userId)
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    async getAuctionDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemId = req.params.id as string;
            this._logger.info('finding auction item details for', { itemId: itemId })
            const result = await this._auctionItemService.getAuctionDetails(itemId);
            this._logger.info('founded result', {
                result: result
            })
            SuccessResponse(res, MESSAGES.AUCTION_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async updateAuctionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = req.body;
            const result = await this._auctionItemService.updateAuctionStatus(data);
            SuccessResponse(res, MESSAGES.AUCTION_STATUS_UPDATED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async editAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id;
            const itemId = req.params.id as string;
            const data = req.body;
            const result = await this._auctionItemService.editAuction(userId, itemId, data)
            SuccessResponse(res, MESSAGES.AUCTION_UPDATED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
    async cancellAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id;
            const {auctionId,cancelledRole,cencelingReason}=req.body;
            const result=await this._auctionItemService.cancellAuction(userId,{auctionId,cancelledRole,cencelingReason});
            SuccessResponse(res,MESSAGES.AUCTION_CANCELLED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}