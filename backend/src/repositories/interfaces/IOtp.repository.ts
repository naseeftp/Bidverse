import { IOTP } from '../../types/otp.type';


export interface IOtpRepository  {
    findByEmailAndOtp(email: string, otp: string): Promise<IOTP | null>
    updateOtp(
    email: string,
    data: {
        otp: string;
        expiresAt: Date;
    }
): Promise<void>;
    create(data: Partial<IOTP>): Promise<void>;
    findByEmail(email: string): Promise<IOTP | null>;
    deleteByEmail(email: string): Promise<void>;
}