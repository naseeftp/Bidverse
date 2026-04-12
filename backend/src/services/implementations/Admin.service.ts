import { IAdminService, IPaginatedResponse } from "../interface/IAdmin.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { AuctionHouseResponseDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { ILoggerService } from "../interface/ILogger.service";
import { AppError } from "../../errors/AppError";


export class AdminService implements IAdminService {
    constructor(
        private _auctionHouseRepo: IAuctionHouseRepository,
        private _logger: ILoggerService
    ) { }
    async listAllAuctionHouses(page: number, limit: number): Promise<IPaginatedResponse<AuctionHouseResponseDTO>> {
        try {
            const activePage = Math.max(1, page);
            const activeLimit = Math.max(1, Math.min(1, 100))
            this._logger.info('admin fetching all auctionhouses', { page: activePage, limit: activeLimit })
            const { houses, total } = await this._auctionHouseRepo.findAllPaginated(activePage, activeLimit)
            const mappedHouses = houses.map(house => AuctionHouseMapper.toResponseDTO(house))
            return {
                houses: mappedHouses,
                pagination: {
                    totalItems: total,
                    itemsPerPage: activeLimit,
                    currentPage: activePage,
                    totalPages: Math.ceil(total / activeLimit),
                    hasNextPage: activePage * activeLimit < total,
                    hasPrevPage: activePage > 1
                }
            }
        } catch (error) {
            this._logger.error("Error in listAllAuctionHouses service", { error });
            throw new AppError("Failed to list auction houses for administrative review.");
        }
    }
}