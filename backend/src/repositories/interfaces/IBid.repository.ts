import { UpdateResult } from "mongoose";
import { IBidDocument } from "../../types/bid.type";
import { IBaseRepository } from "./IBase.repository";
import { Types } from "mongoose";
import { myBidListDTO } from "../../dtos/user.dto/bid.dto";


export interface IBidRepository extends IBaseRepository<IBidDocument> {
    makeOutBid(exceptedBidId: Types.ObjectId, auctionId: string): Promise<UpdateResult>
    getUserBids(userId:string,page:number,limit:number,status?:string,search?:string):Promise<{docs:myBidListDTO[],total:number}>
}