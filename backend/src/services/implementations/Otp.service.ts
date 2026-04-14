import { IOTPService } from "../interface/IOtp.service";
import { IEmailService } from "../interface/IEmai.service";
import { IOtpRepository } from "../../repositories/interfaces/IOtp.repository";
import { OtpUserData, IOTP } from "../../types/otp.type";
import { genarateOtp, getOtpExpiry, isOtpExpired } from '../../utils/otp.utils'
import { AppError, ValidationError } from "../../errors/AppError";
import { HttpStatus, MESSAGES, otpPurpose } from "../../constants/constants";
import { ILoggerService } from "../interface/ILogger.service";


export class OtpService implements IOTPService {
    constructor(private readonly _otpRepository: IOtpRepository, private _logger: ILoggerService,
        private readonly _emailService: IEmailService
    ) { }
    async generateAndSaveOtp(email: string, name: string, userData: OtpUserData, expiryMinutes: number = 2, purpose: otpPurpose): Promise<{ otp: string; expiresAt: Date }> {
        const otp = genarateOtp(6)
        const expiresAt = getOtpExpiry(expiryMinutes)
        await this._otpRepository.create({
            email: userData.email,
            userData,
            otp,
            expiresAt,
            purpose

        } as any)
        await this._emailService.sendOtpEmail(userData.email, userData.name, otp)
        return { otp, expiresAt }
    }
    async generateAndSaveForgotOtp(email: string, name: string, userData: OtpUserData, expiryMinutes: number, purpose: otpPurpose): Promise<{ otp: string; expiresAt: Date; }> {
        const otp = genarateOtp(6)
        const expiresAt = getOtpExpiry(expiryMinutes)
        await this._otpRepository.create({
            email: email,
            purpose: purpose,
            userData,
            otp,
            expiresAt

        })
        await this._emailService.sendOtpEmail(email, name, otp, purpose)
        return { otp, expiresAt }
    }

    async verifyOtp(email: string, otp: string): Promise<OtpUserData> {
        const otprecord = await this._otpRepository.findByEmailAndOtp(email, otp)
        if (!otprecord) {
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED)

        }
        if (isOtpExpired(otprecord.expiresAt)) {
            await this._otpRepository.deleteById(otprecord._id);
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED)

        }
        return otprecord.userData;
    }
    async resendOtp(email: string, expiryMinutes: number = 1, maxSessionAge: number = 30): Promise<{ email: string; expiresAt: Date }> {

        const otprecord = await this._otpRepository.findOneByField("email", email)

        if (!otprecord) {
            throw new AppError(MESSAGES.OTP_SESSION_EXPIRED_RESEND, HttpStatus.GONE)
        }
        const sessionAge = Date.now() - new Date(otprecord.createdAt!).getTime()
        const maxSessionAgeMs = maxSessionAge * 60 * 1000;
        if (sessionAge > maxSessionAgeMs) {
            await this._otpRepository.deleteByFilter({ email });
            throw new AppError(MESSAGES.OTP_SESSION_EXPIRED_RESEND, HttpStatus.GONE);
        }
        const newOtp = genarateOtp(6);
        const newExpiresAt = getOtpExpiry(expiryMinutes);
        await this._otpRepository.updateById(otprecord._id.toString(), {
            otp: newOtp,
            expiresAt: newExpiresAt
        } as any)
        await this._emailService.sendOtpEmail(email, otprecord.userData.name, newOtp);
        return { email, expiresAt: newExpiresAt };
    }
    async deleteOtp(email: string): Promise<void> {
        await this._otpRepository.deleteByFilter({ email })
    }

}
