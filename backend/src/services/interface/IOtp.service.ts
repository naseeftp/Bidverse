import { OtpUserData, IOTP } from "../../types/otp.type";

export interface IOTPService {
    generateAndSaveOtp(email:string,name:string,userData: OtpUserData,expiryMinutes?:number): Promise<{ otp: string; expiresAt: Date }>
    verifyOtp(email: string, otp: string): Promise<OtpUserData>
    resendOtp(email:string,expiryMinutes?:number,maxSessionAge?:number):Promise<{ email: string; expiresAt: Date }>
    deleteOtp(email: string): Promise<void>
}