import { IAuctionHouseRepository, IPaginatedAuctionHouses } from "../interfaces/IAuctionHouse.repository";
import { IAuctionHouseDocument } from "../../types/auctionhouse.type";
import { BaseRepository } from "./Base.repository";
import { AuctionHouse } from "../../models/auctionHouse.model";

export class AuctionHouseRepository extends BaseRepository<IAuctionHouseDocument> implements IAuctionHouseRepository {
    constructor() {
        super(AuctionHouse)
    }
    async findByUserId(userId: string): Promise<IAuctionHouseDocument | null> {
        return await this.model.findOne({ userId })
    }
    async findByBusinessEmail(email: string): Promise<IAuctionHouseDocument | null> {
        return await this.model.findOne({ "contact.businessEmail": email }).exec()
    }
    async findAllPaginated(page: number, limit: number): Promise<IPaginatedAuctionHouses> {
        
        const skip = (page - 1) * limit
        const [houses, total] = await Promise.all([
            this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.model.countDocuments()
        ])
        console.log('total documrnts and counts',{houses,total})
        return { houses, total }
    }


}