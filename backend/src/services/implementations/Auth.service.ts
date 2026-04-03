import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.utils'
import { hashPassword, comparePassword} from '../../utils/password.util'
import { MESSAGES, Roles, CONFIG } from '../../constants/constants'
import { IAuthService } from '../interface/IAuth.service'
import { RegisterUserDTO, LoginDTO, VerifyotpDTO, ResendOtpDTO,  AuthResponseDTO, UserResponseDTO } from '../../dtos/Common.dto'
import { IUserRepository } from '../../repositories/interfaces/iUser.repository'
import { IOTPService } from '../interface/IOtp.service'
import { ConflictError, UnauthorizedError, NotFoundError, ForbiddenError } from '../../errors/AppError'
import { UserMapper } from '../../mappers/user.mapper'
import { ILoggerService } from '../interface/ILogger.service'
import { oauth2Client } from '../../config/google.confing'
import { google } from 'googleapis'
import { roles } from '../../types/otp.type'
export class AuthService implements IAuthService {
    constructor(private _userRepository: IUserRepository,private _logger:ILoggerService, private _otpService: IOTPService) { }

    async register(data: RegisterUserDTO): Promise<{ email: string; expiresAt: Date }> {
        
        await this._checkUserDoesNotExist(data.email, data.phone)
        const passwordHash = await hashPassword(data.password)
        const otpresult = await this._otpService.generateAndSaveOtp(
            data.email,
            data.name,
            {
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: passwordHash,
                role: data.role || 'user'

            },
            CONFIG.OTP_EXPIRY_MINUTES
        )
        return { email: data.email, expiresAt: otpresult.expiresAt }

    }
    async verifyOtp(data: VerifyotpDTO): Promise<AuthResponseDTO<UserResponseDTO>> {
        const userData = await this._otpService.verifyOtp(data.email, data.otp)

        const user = await this._userRepository.create({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            role: userData.role,
            isActive: true
        })

        const token = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        await this._otpService.deleteOtp(data.email)

        return {
            user: UserMapper.toDTO(user),
            token,
            refreshToken
        }
    }
    async resendOtp(data: ResendOtpDTO): Promise<{ email: string; expiresAt: Date }> {
        const existingUser = await this._userRepository.findByEmail(data.email)
        if (existingUser) {
            throw new ConflictError(MESSAGES.USER_EXISTS_EMAIL)
        }
        return await this._otpService.resendOtp(data.email, CONFIG.OTP_EXPIRY_MINUTES, CONFIG.OTP_RESEND_DELAY_SECONDS)
    }

    async login(data: LoginDTO): Promise<AuthResponseDTO<UserResponseDTO>> {
        const existingUser=await this._userRepository.findByEmail(data.email)
       
        if(!existingUser){
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }
        if(!existingUser.isActive){
            throw new UnauthorizedError(MESSAGES.USER_NOT_ACTIVE)
        }
        
        const passwordMatch=await comparePassword(data.password,existingUser.password!)
        if(!passwordMatch){
            throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS)
        }
        const token=generateAccessToken(existingUser);
        const refreshToken=generateRefreshToken(existingUser)
        return{
            user:UserMapper.toDTO(existingUser),
            token,
            refreshToken
        }
        
    }
    async googleAuth(code: string,role:roles): Promise<AuthResponseDTO<UserResponseDTO>> {
        const {tokens}=await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        const oauth2=google.oauth2({auth:oauth2Client,version:'v2'})
        const {data}=await oauth2.userinfo.get()
          this._logger.info('google user info',{data})
        if(!data.email){
            throw new Error('google email is missing')
        }
        let user=await this._userRepository.findByEmail(data.email)
        if(!user){
            user = await this._userRepository.createOAuthUser({
            email: data.email,
            googleId:data.id!,
            name: data.name || "Google User",
            profileImage: data.picture || "",
             role: role 
        });
        }

        return {
        user: UserMapper.toDTO(user),
        token: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
    }


    private async _checkUserDoesNotExist(email: string, phone: string): Promise<void> {
        const existingUser = await this._userRepository.findByEmail(email)
        if (existingUser) {
            throw new ConflictError(MESSAGES.USER_EXISTS_EMAIL)
        }
        const existingPhone = await this._userRepository.findByPhone(phone)
        if (existingPhone) {
            throw new ConflictError(MESSAGES.USER_EXISTS_PHONE)
        }
    }
}