import { IAdminService} from "../interface/IAdmin.service";
import { IAuctionHouseRepository } from "../../repositories/interfaces/IAuctionHouse.repository";
import { AuctionHouseMapper } from "../../mappers/auctionHouse.mapper";
import { AuctionHouseResponseDTO,AdminAuctionHouseDetailDTO } from "../../dtos/auctionHouse.dto/auctionHouse.dto";
import { UpdateHouseStatusDTO, UpdateUserStatusDTO } from "../../dtos/admin.dto/updatestatus.dto";
import { ILoggerService } from "../interface/ILogger.service";
import { IEmailService } from "../interface/IEmai.service";
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
        private _logger: ILoggerService,
        private _emailService:IEmailService
    ) { }
    async listAllAuctionHouses(page: number, limit: number,search?:string,status?:string): Promise<IGenericPaginatedResposnse<AdminAuctionHouseDetailDTO>> {
        try {
           const { houses, total } = await this._auctionHouseRepo.listAllTenantsWithHouseStatus(
            page, 
            limit, 
            search, 
            status
        );
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
        };
        } catch (error) {
            this._logger.error("Error in listAllAuctionHouses service", { error });
            throw new AppError("Failed to list auction houses for administrative review");
        }
    }
    async getAuctionHouseById(id: string): Promise<AdminAuctionHouseDetailDTO> {
        try {
            const house = await this._auctionHouseRepo.findcombinedData(id);
            if (!house) {
                throw new AppError("Auction House not found");
            }
            return house as unknown as AdminAuctionHouseDetailDTO;

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
            await this._emailService.sendVerificationStatusUpdationEmail(updatedHouse.contact.businessEmail,updatedHouse.name,status,reason)
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
                { name: { $regex: search, $options: 'i' } },
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
            const user = await this._userRepo.findById(id)
            if (!user) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            const mappedUsers = UserMapper.toDTO(user)
            return mappedUsers
        } catch (error) {
            this._logger.error('Error in fetching user', { error })
            throw new AppError('Failed to get User')
        }
    }
    async updateUserStatus(id: string, data: UpdateUserStatusDTO): Promise<UserResponseDTO> {
        try {
            const { isActive, reason } = data;
            this._logger.info('updating the user  status', {
                id: id,
                newStatus: isActive ? 'ACTIVE' : 'FALSE',
                reason: reason
            })
            const updatedData = {
                isActive: isActive,
                BlockingReson: isActive ? null : reason,
                updatedAt: new Date()
            }
            const updatedUser = await this._userRepo.updateById(id, updatedData)
            if (!updatedUser) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            await this._emailService.sendBlockOrUnBlockEmail(updatedUser.email,updatedUser.name,isActive,reason)
            const mappedUser = UserMapper.toDTO(updatedUser)
            return mappedUser
        } catch (error) {
            this._logger.error('Error while updating user', { error })
            throw new AppError('Error while Updating User')
        }
    }
}