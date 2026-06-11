import { IWatchListService } from "../interface/IWatchList.service";
import { IWatchListRepository } from "../../repositories/interfaces/IWatchlist.repository";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { WatchListAddOrDeleteResponseDTO } from "../../dtos/user.dto/watchlist.dto";
import { ConflictError, NotFoundError } from "../../errors/AppError";
import { MESSAGES } from "../../constants/constants";
import { Types } from "mongoose";

export class WatchListService implements IWatchListService{
    constructor(
        private _watchlistRepo:IWatchListRepository,
        private _auctionItemRepo:IAuctionItemRepository

    ){}

    async addToWatchList(userId: string, itemId: string): Promise<WatchListAddOrDeleteResponseDTO> {
        const auctionItem=await this._auctionItemRepo.findById(itemId);
        if(!auctionItem){
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const query={userId,itemId}
        const existingItem=await this._watchlistRepo.findOne(query);
        if(existingItem){
            throw new ConflictError(MESSAGES.WATCHLIST_EXISTED)
        }
        await this._watchlistRepo.create({
            userId:new Types.ObjectId(userId),
            itemId:new Types.ObjectId(itemId)
        })
       return{
        itemid:itemId,
        actionsSuccess:true
       }
    }

}