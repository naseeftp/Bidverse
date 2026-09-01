import { AuctionItemDetailDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { LiveAuctionStateResponseDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";

export interface ILiveAcutionStateService {
    findLiveState(auctionId: string): Promise<LiveAuctionStateResponseDTO>
    joinRoom(userId: string, auctionId: string): Promise<AuctionItemDetailDTO>
    startLive(startedBy: string, auctionId: string): Promise<LiveAuctionStateResponseDTO>
}