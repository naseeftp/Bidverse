import { IOTPService } from "../interface/IOtp.service";
import { IOtpRepository } from "../../repositories/interfaces/IOtp.repository";
import { OtpUserData, IOTP } from "../../types/otp.type";

export class OtpService implements IOTPService {
    private otpRepository: IOtpRepository;
    constructor(otpRepository: IOtpRepository) {
        this.otpRepository = otpRepository
    }
    async generateAndSaveOtp(userData: OtpUserData): Promise<string> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000)
        await this.otpRepository.create({
            email: userData.email,
            userData,
            otp,
            expiresAt

        } as any)

        return otp
    }
    async verifyOtp(email: string, otp: string): Promise<OtpUserData> {
        const otprecord = await this.otpRepository.findByEmailAndOtp(email, otp)
        if (!otprecord) {
            throw new Error('Invalid otp')
            console.log("invalid otp")
        }
        if (new Date() > otprecord.expiresAt) {
            await this.otpRepository.deleteById(otprecord._id);
            throw new Error("OTP has expired");
        }
        return otprecord.userData;
    }
    async deleteOtp(email: string): Promise<void> {
        await this.otpRepository.deleteByFilter({ email })
    }

}
