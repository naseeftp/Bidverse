import { IBaseRepository } from "./IBase.repository";
import { IAuctionHouseDocument } from "../../types/auctionhouse.type";
import { AdminAuctionHouseDetailDTO, PublicAuctionHouseDetailDTO } from '../../dtos/auctionHouse.dto/auctionHouse.dto'
import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
export interface IPaginatedAuctionHouses {
    houses: IAuctionHouseDocument[];
    total: number
}

export interface IAuctionHouseRepository extends IBaseRepository<IAuctionHouseDocument> {
    findByUserId(userId: string): Promise<IAuctionHouseDocument | null>
    findByBusinessEmail(email: string): Promise<IAuctionHouseDocument | null>
    listAllTenantsWithHouseStatus(page: number, limit: number, search?: string, status?: string): Promise<{ houses: AdminAuctionHouseDetailDTO[], total: number }>
    findcombinedData(userId: string): Promise<AdminAuctionHouseDetailDTO | null>

    listPublicAuctionHouses(
        page: number,
        limit: number,
        search?: string,
        category?: string
    ): Promise<{ houses: PublicAuctionHouseResponseDTO[], total: number }>

    getHouseDetailsWithAuctions(
        houseId: string,
        page: number,
        limit: number,
        itemSearch?: string,
        itemStatus?: string
    ): Promise<{ data: PublicAuctionHouseDetailDTO | null, total: number }>

}