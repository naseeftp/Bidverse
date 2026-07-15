import { IPublicAunctionService } from "../interface/IPublicAuction.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { PublicAuctionHouseResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { AuctionItemStatus, MESSAGES } from "../../constants/constants";
import { IAuctionItemRepository } from "../../repositories/interfaces/IAuctionItem.repository";
import { AuctionItemListDTO, AuctionItemDetailDTO } from "../../dtos/auctionHouse.dto/auctionItem.dto";
import { NotFoundError } from "../../errors/AppError";
import { PublicAuctionHouseDetailDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";

export class PublicAuctionService implements IPublicAunctionService {
    constructor(
        private _auctionHouseRepo: IAuctionHouseRepository,
        private _logger: ILoggerService,
        private _auctionItemRepo: IAuctionItemRepository
    ) { }

    async listAllPublicAuctionHouses(page: number, limit: number, search: string, category?: string): Promise<IGenericPaginatedResposnse<PublicAuctionHouseResponseDTO>> {

        const { houses, total } = await this._auctionHouseRepo.listPublicAuctionHouses(page, limit, search, category)
        return {
            data: houses,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
    async listPublicAuctions(page: number, limit: number, search?: string, type?: string): Promise<IGenericPaginatedResposnse<AuctionItemListDTO>> {
        const publicStatus = [
            AuctionItemStatus.SCHEDULED,
            // AuctionItemStatus.PASSED,
            // AuctionItemStatus.SOLD
        ]

        const { auctions, total } = await this._auctionItemRepo.listAllAuctionItems(page, limit, search, publicStatus, type)
        return {
            data: auctions,
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
    async getAuctionDetail(itemId: string): Promise<AuctionItemDetailDTO | null> {
        const auction = await this._auctionItemRepo.findById(itemId)
        if (!auction) {
            throw new NotFoundError(MESSAGES.AUCTION_NOT_FOUND)
        }
        const result = await this._auctionItemRepo.getAuctionItemDetails(itemId)
        return result
    }
    async getHouseDetailsWithAuctions(houseId: string, page: number, limit: number, itemSearch?: string, itemStatus?: string): Promise<IGenericPaginatedResposnse<PublicAuctionHouseDetailDTO>> {
        const auctionHouse = await this._auctionHouseRepo.findById(houseId);
        if (!auctionHouse) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        }
        const { data, total } = await this._auctionHouseRepo.getHouseDetailsWithAuctions(houseId, page, limit, itemSearch, itemStatus)
        if (!data) {
            throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
        }
        return {
            data: [data],
            pagination: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        }
    }
}