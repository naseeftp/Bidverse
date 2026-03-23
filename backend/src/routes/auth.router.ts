import { Router } from "express";
import { AuthController } from "../controllers/implimentations/Auth.controller";
import { AuthService } from "../services/implementations/Auth.service";
import { UserRepository } from "../repositories/implementations/User.repository";
import { OtpService } from "../services/implementations/Otp.service";
import { OtpRepository } from "../repositories/implementations/Otp.repository";
import { EmailService } from "../services/implementations/Email.service";
import { AuthValidators } from "../validators/auth.validators";
import { validator } from "../middlewares/validation.middleware";
import { AUTH_ROUTES } from "../constants/route.constant";

const userRepository=new UserRepository();
const otpRepository=new OtpRepository();

const emailService=new EmailService();
const otpService=new OtpService(otpRepository,emailService)
const authService=new AuthService(userRepository,otpService)


const authController=new AuthController(authService)

const router=Router()

router.post(
    AUTH_ROUTES.REGISTER,
    validator(AuthValidators.ValidateRegisterInput),
    authController.register
)
router.post(
    AUTH_ROUTES.VERIFY_OTP,
    validator(AuthValidators.validateVerifyOtpInput),
    authController.resendOtp
)
router.post(
    AUTH_ROUTES.RESEND_OTP,
    validator(AuthValidators.validateResendOtpInput),
    authController.resendOtp
)

export default router