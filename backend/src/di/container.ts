import { UserRepository } from "../repositories/implementations/User.repository";
import { OtpRepository } from "../repositories/implementations/Otp.repository";
import { AuthController } from "../controllers/implimentations/Auth.controller";
import { AuthService } from "../services/implementations/Auth.service";
import { OtpService } from "../services/implementations/Otp.service";
import { EmailService } from "../services/implementations/Email.service";
import { LoggerService } from "../services/implementations/Logger.service";


const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const emailLogger=new LoggerService("EmailService")
const emailService = new EmailService(emailLogger)
const otpLogger=new LoggerService('OtpService')
const otpService = new OtpService(otpRepository,otpLogger,emailService)
const authLogger=new LoggerService('AuthService')
const authService = new AuthService(userRepository,authLogger,otpService)
export const authController = new AuthController(authService)
