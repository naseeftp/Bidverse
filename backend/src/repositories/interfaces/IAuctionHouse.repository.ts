import { IBaseRepository } from "./IBase.repository";
import { IAuctionHouseDocument } from "../../types/auctionhouse.type";
import {QueryFilter, UpdateQuery} from 'mongoose'


export interface IPaginatedAuctionHouses {
    houses: IAuctionHouseDocument[];
    total: number
}

export interface IAuctionHouseRepository extends IBaseRepository<IAuctionHouseDocument> {
    findByUserId(userId: string): Promise<IAuctionHouseDocument | null>
    findByBusinessEmail(email: string): Promise<IAuctionHouseDocument | null>
    findAllPaginated(page: number, limit: number): Promise<IPaginatedAuctionHouses>
}