import { IAdminService, IPaginatedResponse } from "../interface/IAdmin.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { AuctionHouseResponseDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { UpdateHouseStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import { ILoggerService } from "../interface/ILogger.service";
import { AppError, NotFoundError, ValidationError } from "../../errors/AppError";
import { VerificationStatus } from "../../constants/constants";
import { MESSAGES } from "../../constants/constants";


export class AdminService implements IAdminService {
    constructor(
        private _auctionHouseRepo: IAuctionHouseRepository,
        private _logger: ILoggerService
    ) { }
    async listAllAuctionHouses(page: number, limit: number): Promise<IPaginatedResponse<AuctionHouseResponseDTO>> {
        try {
            const activePage = Math.max(1, page);
            const activeLimit = Math.max(1, Math.min(limit, 100))
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
    async getAuctionHouseById(id: string): Promise<AuctionHouseResponseDTO> {
        try {
            const house = await this._auctionHouseRepo.findById(id);
            if (!house) {
               throw new AppError("Auction House not found");
            }
            return house as unknown as AuctionHouseResponseDTO;

        } catch (error) {
           this._logger.error(`Service Error: Failed to fetch auction house with ID ${id}`, { error });
           throw new AppError("Failed to get the auction house.");
        }
    }

    async updateAuctionHouseStatus(id: string, data: UpdateHouseStatusDTO): Promise<AuctionHouseResponseDTO> {
        try {
            const { status, reason } = data
            this._logger.info('udatating status of the auction house', { Id: id, statusofhouse: status })
            const uodateData = {
                status: status,
                rejectionReason: status === VerificationStatus.REJECTED ? reason : null,
                isVerified: status === VerificationStatus.APPROVED
            }
            const updatedHouse = await this._auctionHouseRepo.updateById(id, uodateData)
            if (!updatedHouse) {
                throw new NotFoundError(MESSAGES.AUCTION_HOUSE_NOT_FOUND)
            }
            return AuctionHouseMapper.toResponseDTO(updatedHouse)
        } catch (error) {
            this._logger.error("Error in updating status service", { error });
            throw new AppError("Failed to update the status.");
        }
    }
}