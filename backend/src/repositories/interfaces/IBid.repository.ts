import { UpdateResult } from "mongoose";
import { IBidDocument } from "../../types/bid.type";
import { IBaseRepository } from "./IBase.repository";
import { Types } from "mongoose";


export interface IBidRepository extends IBaseRepository<IBidDocument> {
    makeOutBid(exceptedBidId: Types.ObjectId, auctionId: string): Promise<UpdateResult>
}