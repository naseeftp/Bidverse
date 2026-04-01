import { Router } from "express";
import { authController } from "../di/container";
import { AuthValidators } from "../validators/auth.validators";
import { validator } from "../middlewares/validation.middleware";
import { AUTH_ROUTES } from "../constants/route.constant";
// injection logic in seperate file
const router = Router()
router.post(
    AUTH_ROUTES.REGISTER,
    validator(AuthValidators.ValidateRegisterInput),
    (req, res, next) => authController.register(req, res, next)
)
router.post(
    AUTH_ROUTES.VERIFY_OTP,
    validator(AuthValidators.validateVerifyOtpInput),
    (req, res, next) => authController.verifyOtp(req as any, res, next)
)
router.post(
    AUTH_ROUTES.RESEND_OTP,
    validator(AuthValidators.validateResendOtpInput),
    (req, res, next) => authController.resendOtp(req, res, next)
)
router.post(
    AUTH_ROUTES.LOGIN,
    validator(AuthValidators.validateLoginInput),
    (req, res, next) => authController.login(req, res, next)
)



export default router