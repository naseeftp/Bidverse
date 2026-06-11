
export interface WatchListAddOrDeleteResponseDTO {
    itemid: string;
    actionsSuccess: boolean
}
export interface WatchedItemDetailsDTO {
    id: string;
    title: string;
    status: string;
    type: string;
    currency: 'INR',
    currentBid: number;
    minimumIncrement: number;
    primaryImageUrl: string;
    startTime: string;
    endTime: string;
}
export interface WatchListResponseDTO {
    watchlistId: string;
    userId: string;
    addedAt: string;
    item: WatchedItemDetailsDTO
}
