import { IPublicAuctionController } from "../interfaces/IPublicAuction.controller";
import { ILoggerService } from "../../services/interface/ILogger.service";
import { IPublicAunctionService } from "../../services/interface/IPublicAuction.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";
export class PublicAuctionController implements IPublicAuctionController{
    constructor(
        private _publicAuctionService:IPublicAunctionService,
        private _logger:ILoggerService
    ){}
   async  listAllPublicAuctionHouses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||10;
            const search=req.query.search as string
            this._logger.info('fetching public auction house list',{page:page,limit:limit,search:search})
            const result=await this._publicAuctionService. listAllPublicAuctionHouses(page,limit,search)
            SuccessResponse(res,MESSAGES.LIST_RETRIEVED,result,HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}