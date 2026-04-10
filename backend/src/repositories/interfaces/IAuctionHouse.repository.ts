import { IBaseRepository } from "./IBase.repository";
import { IAuctionHouseDocument } from "../../types/auctionhouse.type";

export interface IAuctionHouseRepository extends IBaseRepository<IAuctionHouseDocument> {
    findByUserId(userId: string): Promise<IAuctionHouseDocument | null>
    findByBusinessEmail(email: string): Promise<IAuctionHouseDocument | null>
}