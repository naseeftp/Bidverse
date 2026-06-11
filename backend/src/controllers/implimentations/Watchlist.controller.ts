import { IWatchlistController } from "../interfaces/IWatchlist.controller";
import { IWatchListService } from "../../services/interface/IWatchList.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class WatchListController implements IWatchlistController{
    constructor(
        private _watchLisService:IWatchListService
    ){}
    async addToWatchList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user.id as string;
            const {itemId}=req.body
            const result= await this._watchLisService.addToWatchList(userId,itemId)
            SuccessResponse(res,MESSAGES.WATCHLIST_ADDED,result,HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
}