import { UserRepository } from "../repositories/implementations/User.repository";
// import { OtpRepository } from "../repositories/implementations/Otp.repository";
import { AuthController } from "../controllers/implimentations/Auth.controller";
import { AuthService } from "../services/implementations/Auth.service";
import { OtpService } from "../services/implementations/Otp.service";
import { EmailService } from "../services/implementations/Email.service";
import { LoggerService } from "../services/implementations/Logger.service";
import { RedisOtpRepository } from "../repositories/implementations/RedisOtp.repository";
import { NotificationService } from "../services/implementations/Notification.service";
import { NotificationRepository } from "../repositories/implementations/NotificationRepository";

const userRepository = new UserRepository();
// const otpRepository = new OtpRepository();
const otpRedisRepo=new RedisOtpRepository()
const emailLogger = new LoggerService("EmailService")
const emailService = new EmailService(emailLogger)
const otpLogger = new LoggerService('OtpService')
const otpService = new OtpService(otpRedisRepo, otpLogger, emailService)
const authLogger = new LoggerService('AuthService')
const authService = new AuthService(userRepository, authLogger, otpService)
export const authController = new AuthController(authService)

import { AuctionHouseRepository } from "../repositories/implementations/AuctionHouse.repository";
import { AuctionHouseService } from "../services/implementations/AuctionHouse.service";
import { AuctionHouseController } from "../controllers/implimentations/AuctionHouse.controller";

const Logger = new LoggerService();
const repo = new AuctionHouseRepository();
const notificationRepo=new NotificationRepository()
const notificationService=new NotificationService(notificationRepo)
const service = new AuctionHouseService(repo, Logger,notificationService,userRepository)
export const auctionHouseController = new AuctionHouseController(service, Logger)

import { AdminService } from "../services/implementations/Admin.service";
import { AdminController } from "../controllers/implimentations/Admin.controller";

const adminLogger = new LoggerService()
const adminRepo = new AuctionHouseRepository();
const userRepo = new UserRepository()
const AdminemailLogger = new LoggerService('EmailLogger')
const adminEmailService = new EmailService(AdminemailLogger)
const adminService = new AdminService(adminRepo, userRepo, adminLogger, adminEmailService);
export const adminController = new AdminController(adminService, adminLogger)
