import { EmailConfig } from "../../types/email.type";

export interface IEmailService{
    sendEmail(config:EmailConfig):Promise<void>;
    sendOtpEmail(email:string,name:string,otp:string):Promise<void>
}