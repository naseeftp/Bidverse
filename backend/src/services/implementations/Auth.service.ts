import {generateAccessToken,generateRefreshToken,verifyAccessToken,verifyRefreshToken} from '../../utils/jwt.utils'
import { hashPassword,comparePassword,validatePassword,validatePasswordMatch} from '../../utils/Password.util'
import {MESSAGES,Roles,CONFIG} from '../../constants/constants'
import { IAuthService } from '../interface/IAuth.service'
import { RegisterUserDTO,LoginDTO,VerifyotpDTO,ResendOtpDTO,ForgetPaswordDTO,ForgetPasswordVerifyOtpDTO,ResetPasswordDTO,changePasswordDTO,AuthResponseDTO,UserResponseDTO} from '../../dtos/Common.dto'
import {IUserDocument} from '../../types/user.type'
import {IUserRepository} from '../../repositories/interfaces/iUser.repository'
import { IOtpRepository } from '../../repositories/interfaces/IOtp.repository'
import { IOTPService } from '../interface/IOtp.service'
import { ConflictError,UnauthorizedError,NotFoundError,ForbiddenError } from '../../errors/AppError'
import { UserMapper } from '../../mappers/user.mapper'

export class AuthService implements IAuthService{
    constructor(private _userRepository:IUserRepository,private _otpService:IOTPService){}

    async register(data: RegisterUserDTO): Promise<{ email: string }> {
        validatePasswordMatch(data.password,data.confirmPassword)
        validatePassword(data.password)
        await this._checkUserDoesNotExist(data.email,data.phone)
        const passwordHash=await hashPassword(data.password)
        await this._otpService.generateAndSaveOtp(
            data.email,
            data.name,
            {
             name:data.name,
             email:data.email,
             phone:data.phone,
             password: passwordHash,
             role:data.role||'user'
            
            },
            CONFIG.OTP_EXPIRY_MINUTES
        )
        return {email:data.email}
    
    }
    async verifyOtp(data: VerifyotpDTO): Promise<AuthResponseDTO<UserResponseDTO>> {
        const userData=await this._otpService.verifyOtp(data.email,data.otp)
        const user=await this._userRepository.create({
            name:userData.name,
            email:userData.email,
            phone:userData.phone,
            password:userData.password,
            role:userData.role,
            isActive:true
        })
        const token=generateAccessToken(user)
        const refreshToken=generateRefreshToken(user)
        await this._otpService.deleteOtp(data.email)
        return {
            user:UserMapper.toDTO(user),
            token,
            refreshToken
        }
    }
    async resendOtp(data: ResendOtpDTO): Promise<void> {
        const existingUser=await this._userRepository.findByEmail(data.email)
        if(existingUser){
            throw new ConflictError(MESSAGES.USER_EXISTS_EMAIL)
        }
        await this._otpService.resendOtp(data.email,CONFIG.OTP_EXPIRY_MINUTES,CONFIG.OTP_RESEND_DELAY_SECONDS)
    }
    

    
    private async _checkUserDoesNotExist(email:string,phone:string):Promise<void>{
        const existingUser=await this._userRepository.findByEmail(email)
        if(existingUser){
            throw new ConflictError(MESSAGES.USER_EXISTS_EMAIL)
        }
        const existingPhone=await this._userRepository.findByPhone(phone)
        if(existingPhone){
            throw new ConflictError(MESSAGES.USER_EXISTS_PHONE)
        }
    }
}