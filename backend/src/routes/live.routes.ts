import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect,allowedTo } from "../middlewares/auth.middleware";
import { LIVE_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import liveController from "../di/live.container";


const router=Router();
router.use(protect);
router.use(CheckUserBlocked)
router.use(
    LIVE_ROUTES.GET_LIVE_STATE,
    allowedTo(Role.TENANT),
    (req,res,next)=>liveController.findLiveState(req,res,next)
    
)

export default router;