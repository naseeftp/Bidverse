import { UserRepository } from "../repositories/implementations/User.repository";
import { OtpRepository } from "../repositories/implementations/Otp.repository";
import { AuthController } from "../controllers/implimentations/Auth.controller";
import { AuthService } from "../services/implementations/Auth.service";
import { OtpService } from "../services/implementations/Otp.service";
import { EmailService } from "../services/implementations/Email.service";

const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const emailService = new EmailService()
const otpService = new OtpService(otpRepository, emailService)
const authService = new AuthService(userRepository, otpService)
export const authController = new AuthController(authService)
