import { IBaseRepository } from "./IBase.repository";
import { IOTP } from '../../types/otp.type';


export interface IOtpRepository extends IBaseRepository<IOTP> {
    findByEmailAndOtp(email: string, otp: string): Promise<IOTP | null>
    updateOtp(email: string, data: { otp: string | null; expiresAt: Date }): Promise<IOTP | null>
}