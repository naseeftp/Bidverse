import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CHECKOUT_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import checkOutController from "../di/checkout.container";


const router = Router()
router.use(protect);
router.use(CheckUserBlocked)
router.get(
    CHECKOUT_ROUTES.GET_CHECKOUT,
    allowedTo(Role.USER),
    (req, res, next) => checkOutController.getCheckOutDetails(req, res, next)

)

export default router