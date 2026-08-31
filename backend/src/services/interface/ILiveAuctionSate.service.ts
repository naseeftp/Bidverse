import { LiveAuctionStatus } from "../../constants/constants";
import { LiveAuctionStateResponseDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";

export interface ILiveAcutionStateService{
    findLiveState(auctionId:string):Promise<LiveAuctionStateResponseDTO>
}