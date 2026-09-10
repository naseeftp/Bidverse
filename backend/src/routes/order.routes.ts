import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { Role } from "../dtos/Common.dto";
import { ORDER_ROUTES } from "../constants/route.constant";
import { orderController } from "../di/order.container";

const router = Router();
router.use(protect)
router.use(CheckUserBlocked)

router.post(
    ORDER_ROUTES.PLACE_ORDER,
    allowedTo(Role.USER),
    (req, res, next) => orderController.initiateOrderPayment(req, res, next)
)

export default router