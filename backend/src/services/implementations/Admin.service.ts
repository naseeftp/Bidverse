import { IAdminService, IPaginatedResponse } from "../interface/IAdmin.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { AuctionHouseResponseDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { UpdateHouseStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import { ILoggerService } from "../interface/ILogger.service";
import { AppError, NotFoundError } from "../../errors/AppError";
import { VerificationStatus } from "../../constants/constants";
import { MESSAGES } from "../../constants/constants";
import { UserResponseDTO } from "../../dtos/Common.dto";
import { IGenericPaginatedResposnse } from "../../types/response.type";
import { QueryFilter } from "mongoose";
import { IUserDocument } from "../../types/user.type";
import { Role } from "../../dtos/Common.dto";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { UserMapper } from "../../mappers/user.mapper";
import { isValidObjectId } from "mongoose";
export class AdminService implements IAdminService {
    constructor(
        private _auctionHouseRepo: IAuctionHouseRepository,
        private _userRepo: IUserRepository,
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
            throw new AppError("Failed to list auction houses for administrative review");
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
    async listAllUsers(page: number, limit: number, search?: string, status?: string): Promise<IGenericPaginatedResposnse<UserResponseDTO>> {
        const filter: QueryFilter<IUserDocument> = { role: Role.USER }
        if (status === 'blocked') {
            filter.isActive = false
        }
        else if (status === 'active') {
            filter.isActive = true
        }

        if (search) {
            const isFullId = isValidObjectId(search)
            filter.$or = [
                { name:  { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                isFullId
                    ? { _id: search } 

                    : {  //partial search"
                        $expr: {  //alws to use aggregation oprtrs in mngdb queries(eg:$toString)
                            $regexMatch: {
                                input: { $toString: "$_id" },
                                regex: search,
                                options: "i"
                            }
                        }
                    }
            ]
        }
        const { docs, total } = await this._userRepo.findAllPaginatedUsers(page, limit, filter)
        const mappedUsers = docs.map(doc => UserMapper.toDTO(doc))
        return {
            data: mappedUsers,
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
    async getUserById(id: string): Promise<UserResponseDTO> {
        try {
            const user=await this._userRepo.findById(id)
            if(!user){
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            const mappedUsers=UserMapper.toDTO(user)
            return mappedUsers
        } catch (error) {
            this._logger.error('Error in fetching user',{error})
            throw new AppError('Failed to get User')
        }
    }
}