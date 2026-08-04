import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { Role } from "../dtos/Common.dto";
import { bidController } from "../di/bid.container";
import { BID_ROUTES } from "../constants/route.constant";

const router = Router()
router.use(protect);
router.use(CheckUserBlocked);
router.post(
    BID_ROUTES.PLACE_BID,
    allowedTo(Role.USER),
    (req, res, next) => bidController.placdBid(req, res, next)
)
router.get(
    BID_ROUTES.MY_BIDS,
    allowedTo(Role.USER),
    (req, res, next) => bidController.getUserBids(req, res, next)
)
router.get(
    BID_ROUTES.BID_HISTORY,
    allowedTo(Role.TENANT,Role.ADMIN),
    (req,res,next)=>bidController.getBidHistory(req,res,next)
)
export default router; 