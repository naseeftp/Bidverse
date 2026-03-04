import { OtpUserData, IOTP } from "../../types/otp.type";

export interface IOTPService {
    generateAndSaveOtp(userData: OtpUserData): Promise<string>
    verifyOtp(email: string, otp: string): Promise<OtpUserData>
    deleteOtp(email: string): Promise<void>
}