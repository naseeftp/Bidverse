import { BaseRepository } from "./Base.repository";
import { IBidRepository } from "../interfaces/IBid.repository";
import { IBidDocument } from "../../types/bid.type";
import {Bid} from '../../models/bid.model'
import { Types ,UpdateResult} from "mongoose";

export class BidRepository extends BaseRepository<IBidDocument> implements IBidRepository{
    constructor(){
        super(Bid)
    }
    async makeOutBid(exceptedBidId: Types.ObjectId, auctionId: string): Promise<UpdateResult>{
        return this.model.updateMany(
            {
                auctionId:{$eq:new Types.ObjectId(auctionId)},
                _id:{$ne:exceptedBidId},
                status:{$ne:'outbid'}
            },{
                $set:{
                    status:'outbid'
                }
            }
        )
    }
    
}