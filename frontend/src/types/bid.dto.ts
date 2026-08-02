
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