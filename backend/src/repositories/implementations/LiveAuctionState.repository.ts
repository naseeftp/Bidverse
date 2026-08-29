import { BaseRepository } from "./Base.repository";
import { ILiveAuctionStateRepository } from "../interfaces/ILiveAuctionStateRepository";
import { ILiveAuctionStateDocument } from "../../types/liveAuction.type";
import { LiveAuctionState } from "../../models/liveAuction.state.model";
import { CreateLiveAuctionStateDTO } from "../../dtos/auctionHouse.dto/live.auction.dto";

export class LiveAuctionSateRepository extends BaseRepository<ILiveAuctionStateDocument> implements ILiveAuctionStateRepository{
    constructor(){
    super(LiveAuctionState)
    }
    
    async createLiveState(data:CreateLiveAuctionStateDTO): Promise<ILiveAuctionStateDocument>{
        return await this.model.create(data)
    }
}