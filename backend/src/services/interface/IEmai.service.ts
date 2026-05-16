import { EmailConfig } from "../../types/email.type";
import { otpPurpose } from "../../constants/constants";
export interface IEmailService {
    sendEmail(config: EmailConfig): Promise<void>;
    sendOtpEmail(email: string, name: string, otp: string, purpose?: otpPurpose): Promise<void>
    sendBlockOrUnBlockEmail(email:string,name:string,isActive:boolean,reason?:string):Promise<void>
}