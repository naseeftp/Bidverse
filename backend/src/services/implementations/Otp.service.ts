import { IOTPService } from "../interface/IOtp.service";
import { IEmailService } from "../interface/IEmai.service";
import { IOtpRepository } from "../../repositories/interfaces/IOtp.repository";
import { OtpUserData, IOTP } from "../../types/otp.type";
import { genarateOtp, getOtpExpiry, isOtpExpired } from '../../utils/otp.utils'
import { AppError, ValidationError } from "../../errors/AppError";
import { HttpStatus, MESSAGES } from "../../constants/constants";


export class OtpService implements IOTPService {
    constructor(private readonly _otpRepository: IOtpRepository,
        private readonly _emailService: IEmailService
    ) { }
    async generateAndSaveOtp(email: string, name: string, userData: OtpUserData, expiryMinutes: number = 1): Promise<string> {
        const otp = genarateOtp(6)
        const expiresAt = getOtpExpiry(expiryMinutes)
        await this._otpRepository.create({
            email: userData.email,
            userData,
            otp,
            expiresAt

        } as any)
        await this._emailService.sendOtpEmail(userData.email, userData.name, otp)
        return otp
    }
    async verifyOtp(email: string, otp: string): Promise<OtpUserData> {
        const otprecord = await this._otpRepository.findByEmailAndOtp(email, otp)
        if (!otprecord) {
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED)
            console.log("invalid otp")
        }
        if (isOtpExpired(otprecord.expiresAt)) {
            await this._otpRepository.deleteById(otprecord._id);
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED)
            console.log("otp expired")
        }
        return otprecord.userData;
    }
    async resendOtp(email: string, expiryMinutes: number = 1, maxSessionAge: number = 30): Promise<void> {
        const otprecord = await this._otpRepository.findOneByField("email", email)
        if (!otprecord) {
            throw new AppError(MESSAGES.OTP_SESSION_EXPIRED_RESEND, HttpStatus.GONE)
        }
        const sessionAge = Date.now() - new Date(otprecord.createdAt!).getTime() //! (non-null assertion) says that it has a creation time
        const maxSessionAgeMs = maxSessionAge * 60 * 1000;

    }
    async deleteOtp(email: string): Promise<void> {
        await this._otpRepository.deleteByFilter({ email })
    }

}
