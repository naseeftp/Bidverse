import { IWatchlistController } from "../interfaces/IWatchlist.controller";
import { IWatchListService } from "../../services/interface/IWatchList.service";
import { Request, Response, NextFunction } from "express";
import { SuccessResponse } from "../../utils/response.utility";
import { HttpStatus, MESSAGES } from "../../constants/constants";

export class WatchListController implements IWatchlistController {
    constructor(
        private _watchListService: IWatchListService
    ) { }
    async addToWatchList(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user.id as string;
            const { itemId } = req.body
            const result = await this._watchListService.addToWatchList(userId, itemId)
            SuccessResponse(res, MESSAGES.WATCHLIST_ADDED, result, HttpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }
    async findAllWatchListItems(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page);
            const limit = Number(req.query.limit);
            const userId = req.user.id;
            const result = await this._watchListService.findAllWatchListItems(page, limit, userId);
            SuccessResponse(res, MESSAGES.LIST_RETRIEVED, result, HttpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}