import { LiveAuctionStateResponseDTO } from "../dtos/auctionHouse.dto/live.auction.dto";
import { ILiveAuctionStateDocument } from "../types/liveAuction.type";

export class LiveStateMapper{
    static toLiveStateResponseDTO(data:ILiveAuctionStateDocument):LiveAuctionStateResponseDTO{
        return{
            liveStateId:data._id.toString(),
            status:data.status,
            totalPause:data.totalPauseDuration,
            auctionId:data.auctionItemId.toString()
        }
    }
}