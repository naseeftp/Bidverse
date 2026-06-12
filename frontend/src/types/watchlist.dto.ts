import { AuctionItemStatus } from "./auctionItem.dto";
export interface WatchListAddOrDeleteResponseDTO {
    itemid: string;
    actionsSuccess: boolean
}

export interface WatchlistItemCardDTO {
    watchlistId: string;
    addedAt: Date;
    auctionItemId: string;
    title: string;
    status: AuctionItemStatus; 
    currentBid: number;
    startingPrice: number;
    minimumIncrement: number;
    currency: string;
    endTime: Date;
    startTime:Date;
    imageUrl: string;
}