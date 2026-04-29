import { changePasswordDTO, profileDetailChangeDTO, UserResponseDTO } from "../../dtos/Common.dto";
import { IProfileService } from "../interface/IProfile.service";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { MESSAGES } from "../../constants/constants";
import { AppError, NotFoundError } from "../../errors/AppError";
import { UserMapper } from "../../mappers/user.mapper";
import { comparePassword, hashPassword } from "../../utils/Password.util";
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
    async changeProfileDetails(id: string, data: profileDetailChangeDTO): Promise<UserResponseDTO> {
        try {
            const { name, phone } = data

            if (phone) {
                const existingPhone = await this._userRepo.findByPhone(phone as string)
                if (existingPhone && existingPhone._id.toString() != id) {
                    throw new AppError(MESSAGES.USER_EXISTS_PHONE)
                }
            }
            this._logger.info('updating user profile details', {
                id: id,
                userName: name,
                phone: phone
            })
            const formData = {
                name: name,
                phone: phone,
                updatedAt: new Date()
            }
            const updatedUser = await this._userRepo.updateById(id, formData)
            if (!updatedUser) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            return UserMapper.toDTO(updatedUser)
        } catch (error) {
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            this._logger.error('failed to updated user details', error)
            throw new AppError(MESSAGES.USER_DETAILS_UPDTD_FAILED)
        }
    }
    async changePassword(id: string, data: changePasswordDTO): Promise<UserResponseDTO> {
        try {
            const existingUser = await this._userRepo.findById(id)
            if (!existingUser) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            const passwordMatch = await comparePassword(data.oldPassword, existingUser.password!)
            if (!passwordMatch) {
                throw new AppError(MESSAGES.OLD_PASSWORDS_NOT_MATCH)
            }
            const hashedPassword = await hashPassword(data.newPassword)
            const formData = {
                password: hashedPassword
            }
            const updatedUser = await this._userRepo.updateById(id, formData)
            if (!updatedUser) {
                throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
            }
            return UserMapper.toDTO(updatedUser)
        } catch (error) {
            this._logger.error('failed to change updated user password', error)
            if (error instanceof AppError || error instanceof NotFoundError) {
                throw error;
            }
            throw new AppError(MESSAGES.PASSWORD_CHANGE_FAILED)
        }
    }

}