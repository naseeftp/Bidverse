import { IAuctionHouseRepository } from "../interfaces/IAuctionHouse.repository";
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
}