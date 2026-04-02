import nodemailer, { Transporter } from "nodemailer"
import { env } from "../../config/env"
import { IEmailService } from "../interface/IEmai.service"
import { EmailConfig, SmtpConfig } from "../../types/email.type"
import { CONFIG, HttpStatus, MESSAGES } from '../../constants/constants'
import { AppError } from "../../errors/AppError"
import { getOtpTemplate } from "../../utils/emailTemplates"
import { ILoggerService } from "../interface/ILogger.service";


export class EmailService implements IEmailService {
    private _transporter: Transporter;
    private readonly _fromAddress: string;

    constructor(private _logger:ILoggerService,config?: SmtpConfig) {
        const emailConfig = config || this._getDefualtConfig()
        this._transporter = nodemailer.createTransport(emailConfig)
        this._fromAddress = `"BidVerse" <${env.SMTP_USER}>`
        this._verifyConnection();
    }

    private _getDefualtConfig(): SmtpConfig {
        const emailUser = env.SMTP_USER;
        const emailPass = env.SMTP_PASS;
        const emailHost = env.SMTP_HOST;
        const emailPort = Number(env.SMTP_PORT)
        if (!emailUser || !emailPass) {
            throw new AppError(MESSAGES.EMAIL_CREDENTIALS_NOT_CONFIGURED, HttpStatus.INTERNAL_ERROR)
        }
        return {
            host: emailHost,
            port: emailPort,
            secure: emailPort === 465,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            tls: {
                rejectUnauthorized: false
            }
        }
    }
    private async _verifyConnection(): Promise<void> {
        try {
            await this._transporter.verify()
            this._logger.info('Email Service: Connection Verified')
        } catch (error: unknown) {
           this._logger.error('error while connecting email connection',error)
        }
    }
    async sendEmail(config: EmailConfig): Promise<void> {
        try {
            await this._transporter.sendMail({
                from: this._fromAddress,
                ...config
                
            })
        } catch (error) {
           throw new AppError(MESSAGES.EMAIL_SEND_FAILED, HttpStatus.INTERNAL_ERROR)
        }
    }
    async sendOtpEmail(email: string, name: string, otp: string): Promise<void> {
        const htmlContent=getOtpTemplate(name,otp)
        await this.sendEmail({
            to:email,
            subject:'Your OTP code',
            html:htmlContent
        })
    }
}