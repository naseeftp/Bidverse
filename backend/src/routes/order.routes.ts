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
router.get(
    ORDER_ROUTES.GET_MY_ORDERS,
    allowedTo(Role.USER),
    (req, res, next) => orderController.getUserOrders(req, res, next)
)
router.get(
    ORDER_ROUTES.ORDER_DEATAILS,
    allowedTo(Role.USER, Role.TENANT, Role.ADMIN),
    (req, res, next) => orderController.getUserOrderDetails(req, res, next)
)
router.get(
    ORDER_ROUTES.GET_TENANT_ORDERS,
    allowedTo(Role.TENANT),
    (req, res, next) => orderController.getTenantOrders(req, res, next)
)
router.get(
    ORDER_ROUTES.GET_ADMIN_ORDERS,
    allowedTo(Role.ADMIN),
    (req, res, next) => orderController.getAllOrdersByAdmin(req, res, next)
)
router.patch(
    ORDER_ROUTES.UPDATE_STATUS,
    allowedTo(Role.TENANT),
    (req, res, next) => orderController.updateStatus(req, res, next)
)
router.patch(
    ORDER_ROUTES.MARK_CONFIRMED,
    allowedTo(Role.USER),
    (req,res,next)=>orderController.markAsConfirmed(req,res,next)
)
router.post(
    ORDER_ROUTES.RETURN_REQUEST,
    allowedTo(Role.USER),
    (req,res,next)=>orderController.requestReturn(req,res,next)
)
export default router