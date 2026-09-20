import { Router } from "express";
import { protect,allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { revenueController } from "../di/revenue.container";
import { REVENUE_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";

const router=Router();
router.use(protect);
router.use(CheckUserBlocked);
router.get(
    REVENUE_ROUTES.GET_REVENUE_BREAKDOWN,
    allowedTo(Role.ADMIN),
    (req,res,next)=>revenueController.getRevenueBreakdown(req,res,next)
)
router.get(
    REVENUE_ROUTES.GET_REVENUE_LIST,
     allowedTo(Role.ADMIN),
    (req,res,next)=>revenueController.getIncomingRevenueList(req,res,next)
)
router.get(
    REVENUE_ROUTES.GET_TENANT_REVENUE_BREAKDOWN,
    allowedTo(Role.TENANT),
    (req,res,next)=>revenueController.getTenantRevenueBreakdown(req,res,next)
)
router.get(
    REVENUE_ROUTES.GET_TENANT_REVENUE_LIST,
     allowedTo(Role.TENANT),
    (req,res,next)=>revenueController.getTenantIncomingRevenueList(req,res,next)
)


export default router