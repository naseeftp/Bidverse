import { UserResponseDTO } from "../../dtos/Common.dto";
import { IProfileService } from "../interface/IProfile.service";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { MESSAGES } from "../../constants/constants";
import { AppError, NotFoundError } from "../../errors/AppError";
import { UserMapper } from "../../mappers/user.mapper";
export class ProfileService implements IProfileService {
    constructor(
        private _userRepo: IUserRepository,
        private _logger: ILoggerService
    ) { }

    async getProfileData(id: string): Promise<UserResponseDTO> {
        try {
            const user = await this._userRepo.findById(id)
            if (!user) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            const mappedUser = UserMapper.toDTO(user)
            return mappedUser
        } catch (error) {
            this._logger.error('failed to get userProfile', { error })
            throw new AppError('Failed to get Profile')
        }
    }

}