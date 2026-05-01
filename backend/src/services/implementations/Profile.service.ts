import { changeEmailDTO, changePasswordDTO, profileDetailChangeDTO, UserResponseDTO,changeEmailResponseDto, changeEmailVerificationDTO} from "../../dtos/Common.dto";
import { IProfileService } from "../interface/IProfile.service";
import { IUserRepository } from "../../repositories/interfaces/iUser.repository";
import { ILoggerService } from "../interface/ILogger.service";
import { CONFIG, MESSAGES } from "../../constants/constants";
import { AppError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../errors/AppError";
import { UserMapper } from "../../mappers/user.mapper";
import { comparePassword, hashPassword } from "../../utils/Password.util";
import { IOTPService } from "../interface/IOtp.service";

export class ProfileService implements IProfileService {
    constructor(
        private _userRepo: IUserRepository,
        private _logger: ILoggerService,
        private _otpService:IOTPService
    ) { }

    async getProfileData(id: string): Promise<UserResponseDTO> {

        const user = await this._userRepo.findById(id)
        if (!user) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        const mappedUser = UserMapper.toDTO(user)
        return mappedUser


    }
    async changeProfileDetails(id: string, data: profileDetailChangeDTO): Promise<UserResponseDTO> {

        const { name, phone } = data

        if (phone) {
            const existingPhone = await this._userRepo.findByPhone(phone as string)
            if (existingPhone && existingPhone._id.toString() != id) {
                throw new AppError(MESSAGES.USER_EXISTS_PHONE)
            }
        }
        if (name?.trim().length == 0) {
            throw new ValidationError(MESSAGES.VALID_NAME)
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


    }
    async changePassword(id: string, data: changePasswordDTO): Promise<UserResponseDTO> {

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

    }
    async changeEmail(data: changeEmailDTO): Promise<changeEmailResponseDto> {
        const existingUser=await this._userRepo.findByEmail(data.oldEmail);
        if(!existingUser){
            throw new NotFoundError(`User with ${data.oldEmail} doesnt exist`)
        }
        const userWithNewEmail=await this._userRepo.findByEmail(data.newEmail);
        if(userWithNewEmail){
            throw new ConflictError(`NEW EMAIL ERROR:${MESSAGES.USER_EXISTS_EMAIL}`)
        }
        const isPasswordMatch=await comparePassword(data.password,existingUser.password!)
        if(!isPasswordMatch){
            throw new UnauthorizedError(MESSAGES.PASSWORDS_NOT_MATCH)
        }
        const passwordHash=await hashPassword(data.password)
        const otpresult=await this._otpService.generateAndSaveOtp(
            existingUser.name,
            data.newEmail,
            {
               name:existingUser.name,
               email:data.newEmail,
               phone:existingUser.phone, 
               password:passwordHash,
               role:existingUser.role
            },
            CONFIG.OTP_EXPIRY_MINUTES
        )
        return {email:data.newEmail,expiresAt:otpresult.expiresAt}
    }
    async changeEmailVerification(userId: string, data: changeEmailVerificationDTO): Promise<UserResponseDTO> {
        const otpData=await this._otpService.verifyOtp(data.email,data.otp)
        const formData={
            email:otpData.email
        }
        const updatedUser=await this._userRepo.updateById(userId,formData)
        if(!updatedUser){
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        return UserMapper.toDTO(updatedUser)
    }

}