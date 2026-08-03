import { BidStatus } from "../../constants/constants"

export interface placeBidDTO {
    tenantId: string,
    auctionId: string,
    amount: string
}
export interface bidResponseDTO {
    bidderId: string,
    bidAmount: string,
    placedAt: Date
}

export interface myBidListDTO {
    auctionImage: string;
    auctionTitle: string;
    auctionHouseName: string;
    myLastBidAmount: number;
    currentHighestBid: number;
    myBidStatus: BidStatus;
    endTime?: Date;
}