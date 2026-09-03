import { LiveAuctionStatus } from "../../constants/constants";

export interface CreateLiveAuctionStateDTO {
    auctionItemId: string;
    status?: LiveAuctionStatus;
    totalPausedDuration?: number;
}

export interface LiveAuctionStateResponseDTO {
    liveStateId: string,
    auctionId: string,
    status: LiveAuctionStatus,
    totalPause: number,
    currentRound:number,
    roundsEndsAt:string,
}