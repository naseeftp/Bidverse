export interface LiveAuctionStateResponseDTO {
    liveStateId: string,
    auctionId: string,
    status: string,
    totalPause: number,
    currentRound: number,
    roundsEndsAt: string,
}