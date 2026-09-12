import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { PAYMENT_REQUEST_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import paymentRequestController from "../di/paymentRequest.container";


const router = Router();
router.use(protect);
router.use(CheckUserBlocked);
router.get(
    PAYMENT_REQUEST_ROUTES.LIST_REQUEST,
    allowedTo(Role.USER),
    (req, res, next) => paymentRequestController.getUserPaymentRequests(req, res, next)
)

export default router
