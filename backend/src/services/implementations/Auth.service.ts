import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.utils'
import { hashPassword, comparePassword } from '../../utils/Password.util'
import { MESSAGES, CONFIG, otpPurpose } from '../../constants/constants'
import { IAuthService } from '../interface/IAuth.service'
import { RegisterUserDTO, LoginDTO, VerifyotpDTO, ResendOtpDTO, AuthResponseDTO, UserResponseDTO, ForgetPaswordDTO, ResetPasswordDTO } from '../../dtos/Common.dto'
import { IUserRepository } from '../../repositories/interfaces/iUser.repository'
import { IOTPService } from '../interface/IOtp.service'
import { ConflictError, UnauthorizedError, NotFoundError, AppError, ForbiddenError } from '../../errors/AppError'
import { UserMapper } from '../../mappers/user.mapper'
import { ILoggerService } from '../interface/ILogger.service'
import { oauth2Client } from '../../config/google.confing'
import { google } from 'googleapis'
import { roles } from '../../types/otp.type'
import crypto from 'crypto';

export class AuthService implements IAuthService {
    constructor(private _userRepository: IUserRepository, private _logger: ILoggerService, private _otpService: IOTPService) { }

    async register(data: RegisterUserDTO, purpose: otpPurpose): Promise<{ email: string; expiresAt: Date }> {

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
            CONFIG.OTP_EXPIRY_MINUTES,
            purpose
        )
        return { email: data.email, expiresAt: otpresult.expiresAt }

    }
    async verifyOtp(data: VerifyotpDTO): Promise<AuthResponseDTO<UserResponseDTO> | { email: string; message: string; verified: boolean; resetToken: string }> {
        const userData = await this._otpService.verifyOtp(data.email, data.otp)
        if (data.purpose === 'forgot_password') {
            const resetToken = crypto.randomBytes(32).toString('hex')
            const resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000)
            await this._otpService.deleteOtp(data.email)

            await this._userRepository.updateByFilter({ email: data.email }, {
                passwordResetToken: resetToken,
                passwordResetExpires: resetTokenExpiry
            })
            return {
                message: "OTP Verified. Proceed to reset password.",
                email: data.email,
                verified: true,
                resetToken: resetToken
            }

        }
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
        const existingUser = await this._userRepository.findByEmail(data.email)

        if (existingUser && existingUser.googleId) {
            throw new AppError(MESSAGES.GOOGLE_REGISTERED)
        }

        if (!existingUser) {
            throw new NotFoundError(MESSAGES.USER_NOT_FOUND)
        }

        if (!existingUser.isActive) {
            throw new ForbiddenError(MESSAGES.USER_BLOCKED)
        }

        const passwordMatch = await comparePassword(data.password, existingUser.password!)
        if (!passwordMatch) {
            throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS)
        }
        if (existingUser?.role != data.role) {
            throw new AppError(`this email registered as ${existingUser?.role} please use correct login portal`)
        }
        const token = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser)
        return {
            user: UserMapper.toDTO(existingUser),
            token,
            refreshToken
        }

    }
    async forgotPassword(data: ForgetPaswordDTO, purpose: string): Promise<{ email: string; expiresAt: Date }> {
        const existingUser = await this._userRepository.findByEmail(data.email)
        if (existingUser?.role !== data.role) {
            throw new AppError(`this email registered as ${existingUser?.role} please use correct forgot password portal`)
        }
        if (existingUser && existingUser.googleId) {
            throw new AppError(MESSAGES.GOOGLE_REGISTERED)
        }
        if (!existingUser) {
            throw new NotFoundError(MESSAGES.NOT_FOUND)
        }
        const otpresult = await this._otpService.generateAndSaveForgotOtp(
            existingUser.email,
            existingUser.name,
            {
                name: existingUser.name,
                email: existingUser.email,
                phone: existingUser.phone,
                password: "",
                role: data.role
            },
            CONFIG.FORGOT_PASSWORD_EXPIRY,
            purpose
        )
        return { email: existingUser.email, expiresAt: otpresult.expiresAt }
    }
    async resetPassword(data: ResetPasswordDTO): Promise<void> {
        this._logger.info("Reset Request Received", { email: data.email, token: data.resetToken });
        const user = await this._userRepository.findOne({
            email: data.email,
            passwordResetToken: data.resetToken,
            passwordResetExpires: { $gt: new Date() }
        })
        if (!user) {
            this._logger.warn(`Failed password reset attempt for :${data.email}`)
            throw new UnauthorizedError(MESSAGES.RESET_TOKEN_INVALID)
        }
        this._logger.info("User Found for Reset", { userId: user._id });
        const hashedPassword = await hashPassword(data.password)
        const result = await this._userRepository.updateByFilter(
            { email: data.email },
            {
                $set: { password: hashedPassword },
                $unset: {
                    passwordResetToken: "",
                    passwordResetExpires: ""
                }
            }
        );
        this._logger.info("Update Result from DB", { result });
    }


    async googleAuth(code: string, role: roles): Promise<AuthResponseDTO<UserResponseDTO>> {
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' })
        const { data } = await oauth2.userinfo.get()
        this._logger.info('google user info', { data })
        if (!data.email) {
            throw new Error('google email is missing')
        }
        let user = await this._userRepository.findByEmail(data.email)
        if (user) {
            if (user.role != role) {
                throw new UnauthorizedError(`Unauthorized: This account is registered as a ${user.role}`)
            }
        }
        else {
            user = await this._userRepository.createOAuthUser({
                email: data.email,
                googleId: data.id!,
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
    async refreshToken(token: string): Promise<{ accessToken: string }> {
        try {
            this._logger.info('call for refresh token ', { token: token })
            const decoded = verifyRefreshToken(token);
            this._logger.info('decoded token', { decoded: decoded })
            const user = await this._userRepository.findById(decoded.userId);
            this._logger.info('user founded', { user: user })
            if (!user) {
                throw new UnauthorizedError(MESSAGES.USER_NOT_FOUND)
            }
            if (!user.isActive) {
                throw new ForbiddenError(MESSAGES.USER_BLOCKED)
            }
            const accessToken = generateAccessToken(user)
            this._logger.info('this is the accesstoken', { accessToken })
            return { accessToken }
        } catch (error) {
            if (error instanceof ForbiddenError) {
                throw error
            }
            throw new UnauthorizedError(MESSAGES.INVALID_REFRESH_TOKEN)
        }
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