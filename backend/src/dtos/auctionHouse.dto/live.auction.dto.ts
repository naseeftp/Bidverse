import { LiveAuctionStatus } from "../../constants/constants";

export interface CreateLiveAuctionStateDTO {
    auctionItemId: string;
    status?: LiveAuctionStatus;
    totalPausedDuration?: number;
}

export interface LiveAuctionStateResponseDTO{
    liveStateId:string,
    auctionId:String,
    status:LiveAuctionStatus,
    totalPause:Number,
}