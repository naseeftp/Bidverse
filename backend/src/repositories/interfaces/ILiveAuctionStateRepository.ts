import { IBaseRepository } from "./IBase.repository";
import { ILiveAuctionStateDocument } from "../../types/liveAuction.type";
import { CreateLiveAuctionStateDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";

export interface ILiveAuctionStateRepository extends IBaseRepository<ILiveAuctionStateDocument> {
    createLiveState(data:CreateLiveAuctionStateDTO): Promise<ILiveAuctionStateDocument>
}