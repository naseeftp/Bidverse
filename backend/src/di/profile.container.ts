import { UserRepository } from "../repositories/implementations/User.repository";
import { LoggerService } from "../services/implementations/Logger.service";
import { ProfileService } from "../services/implementations/Profile.service";
import { ProfileController } from "../controllers/implimentations/Profile.controller";
import { OtpService } from "../services/implementations/Otp.service";
import { EmailService } from "../services/implementations/Email.service";
import { OtpRepository } from "../repositories/implementations/Otp.repository";

const userRepo = new UserRepository()
const emailLogger=new LoggerService('EmailLogger')
const otpLogger=new LoggerService('OtpLogget')
const otpRepo=new OtpRepository()
const emailservice=new EmailService(emailLogger)
const otpService=new OtpService(otpRepo,otpLogger,emailservice)
const profiServiceleLogger = new LoggerService('ProfileLogger')
const profileService = new ProfileService(userRepo, profiServiceleLogger,otpService)
const profileControllerLogger = new LoggerService('profileControllerLogger')
export const profileController = new ProfileController(profileService, profileControllerLogger)
