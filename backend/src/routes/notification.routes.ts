import { Router } from "express";
import { allowedTo, protect } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { NOTIFICATION_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import { notificationController } from "../di/notification.container";

const router = Router();
router.use(protect);
router.use(CheckUserBlocked);

router.get(
    NOTIFICATION_ROUTES.GET_NOTIFICATION,
    allowedTo(Role.USER, Role.ADMIN, Role.TENANT),
    (req, res, next) => notificationController.findAllNotificationForUser(req, res, next)
)
router.patch(
    NOTIFICATION_ROUTES.MARK_AS_READ,
    allowedTo(Role.USER, Role.ADMIN, Role.TENANT),
    (req,res,next)=>notificationController.markAsRead(req,res,next)
)
router.patch(
    NOTIFICATION_ROUTES.READ_ALL,
    allowedTo(Role.USER,Role.ADMIN,Role.TENANT),
    (req,res,next)=>notificationController.markAllRead(req,res,next)
)

export default router;