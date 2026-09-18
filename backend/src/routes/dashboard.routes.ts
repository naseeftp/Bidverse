import { DASHBOARD_ROUTES } from "../constants/route.constant";
import { dashboardController } from "../di/dashboard.container";
import { Role } from "../dtos/Common.dto";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";

import { Router } from "express";
const router = Router()
router.use(protect);
router.use(CheckUserBlocked);

router.get(
    DASHBOARD_ROUTES.GET_ADMIN_DASHBOARD,
    allowedTo(Role.ADMIN),
    (req, res, next) => dashboardController.getAdminDashboard(req, res, next)
)
router.get(
    DASHBOARD_ROUTES.GET_TENANT_DASHBOARD,
    allowedTo(Role.TENANT),
    (req, res, next) => dashboardController.getTenantDashboard(req, res, next)

)
export default router