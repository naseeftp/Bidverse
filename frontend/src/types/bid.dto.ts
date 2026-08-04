
export interface placeBidDTO{
    tenantId:string,
    auctionId:string,
    amount:string
}
export interface bidResponseDTO{
    bidderId:string,
    bidAmount:string,
    placedAt:Date
}

export interface myBidListDTO {
    auctionId:string;
    auctionImage: string;
    auctionTitle: string;
    auctionHouseName: string;
    myLastBidAmount: number;
    currentHighestBid: number;
    myBidStatus: string;
    endTime?: Date;
}

export const BidStatus = {
    ACTIVE: "active",
    OUTBID: "outbid",
    WINNING: "winning",
    WON: "won",
    CANCELLED: "cancelled"
} as const;

export type BidStatus = typeof BidStatus[keyof typeof BidStatus];

export interface bidHistoryDTO {
    bidId: string;
    bidderName: string;
    bidAmount: number;
    bidPlacedAt: Date;
    bidStatus: BidStatus
}