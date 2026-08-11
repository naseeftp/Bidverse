import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { PAYMENT_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import { paymentController } from "../di/payment.container";

const router = Router();
router.use(protect)
router.use(CheckUserBlocked)

router.patch(
    PAYMENT_ROUTES.VERIFY_PAYMENT,
    allowedTo(Role.USER),
    (req, res, next) => paymentController.verifyPayment(req, res, next)
)

export default router