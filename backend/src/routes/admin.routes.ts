import { Router } from "express";
import { protect,restrictTo } from "../middlewares/auth.middleware";
import { adminController } from "../di/container";
import { ADMIN_ROUTES } from "../constants/route.constant";

const router=Router()
router.use(protect)

router.get(
    ADMIN_ROUTES.GET_AUCTION_HOUSES,
    restrictTo('admin'),
    (req,res,next)=>adminController.getAuctionHouses(req,res,next)
)

export default router