import { AuctionItemDetailDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { LiveAuctionStateResponseDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";
import { bidResponseDTO} from "../../dtos/user.dto/bid.dto";

export interface ILiveAcutionStateService {
    findLiveState(auctionId: string): Promise<LiveAuctionStateResponseDTO>
    joinRoom(userId: string, auctionId: string): Promise<AuctionItemDetailDTO>
    startLive(startedBy: string, auctionId: string): Promise<LiveAuctionStateResponseDTO>
    placeBid(userId: string, auctionId: string, amount: number, tenantId: string): Promise<bidResponseDTO>
    pauseLive(auctionId: string): Promise<LiveAuctionStateResponseDTO>
    resumeLive(auctionId:string):Promise<LiveAuctionStateResponseDTO>
}