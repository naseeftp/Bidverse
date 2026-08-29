import { LiveAuctionStatus } from "../../constants/constants";

export interface CreateLiveAuctionStateDTO {
    auctionItemId: string;
    status?: LiveAuctionStatus;
    totalPausedDuration?: number;
}