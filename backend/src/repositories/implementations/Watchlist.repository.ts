import { BaseRepository } from "./Base.repository";
import { IWatchListRepository } from "../interfaces/IWatchlist.repository";
import { IWatchListDocument } from "../../types/watchlist.type";
import { Watchlist } from '../../models/watchlist.model'
import {WatchlistItemCardDTO} from '../../dtos/user.dto/watchlist.dto'
import { Types } from "mongoose";
import { IWatchList } from "../../types/watchlist.type";
import { AuctionItemStatus,AuctionType} from "../../constants/constants";

interface IPopulatedAuctionItem {
    _id: Types.ObjectId;
    title: string;
    status: AuctionItemStatus
    currentBid?: number;
    startingPrice: number;
    minimumIncrement: number;
    currency: string;
    endTime: Date;
    startTime:Date;
    type:AuctionType;
    images: Array<{
        url: string;
        isPrimary: boolean;
        _id: Types.ObjectId;
    }>;
}


export class WatchListRepository extends BaseRepository<IWatchListDocument> implements IWatchListRepository {
    constructor() {
        super(Watchlist)
    }
   
       async findAllWatchListItems(page:number,limit:number,userId:string):Promise<{items:WatchlistItemCardDTO[],total:number}>{
       const skip=(page-1)*limit;
       const queryCondition={userId:new Types.ObjectId(userId)};
       const [totalItems,watchListDocs]:[number,IWatchList[]]=await Promise.all([
          this.model.countDocuments(queryCondition),
          this.model.find(queryCondition)
          .populate<{ itemId: IPopulatedAuctionItem }>({
                path: "itemId",
                select: "title currentBid minimumIncrement endTime startTime type status images startingPrice currency",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IWatchList[]>()
       ])

       const mappedItems:WatchlistItemCardDTO[]=watchListDocs
       .filter((doc):doc is IWatchList & { itemId: IPopulatedAuctionItem } => doc.itemId !== null && doc.itemId !== undefined)
       .map((doc)=>{
        const item=doc.itemId;
        const primaryImg = item.images?.find((img) => img.isPrimary)?.url 
                || item.images?.[0]?.url 
                

            return {
                watchlistId: doc._id.toString(),
                addedAt: doc.createdAt,
                auctionItemId: item._id.toString(),
                title: item.title,
                status: item.status,
                currentBid: item.currentBid || item.startingPrice || 0,
                startingPrice: item.startingPrice || 0,
                minimumIncrement: item.minimumIncrement || 0,
                currency: item.currency,
                endTime: item.endTime,
                startTime:item.startTime,
                type:item.type,
                imageUrl: primaryImg
            };
       })
       return{
        items:mappedItems,
        total:totalItems
       }
    }
    
}