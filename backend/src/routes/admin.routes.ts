import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import {adminController} from "../di/container";
import { ADMIN_ROUTES } from "../constants/route.constant";
import { validator } from "../middlewares/validation.middleware";
import { adminValidators } from "../validators/admin.validators";

const router = Router()
router.use(protect)
router.get(
    ADMIN_ROUTES.GET_AUCTION_HOUSES,
    restrictTo('admin'),
    (req, res, next) => adminController.getAuctionHouses(req, res, next)
)
router.get(
    ADMIN_ROUTES.GET_AUCTION_HOUSE, 
    restrictTo('admin'),
    (req, res, next) => adminController.getAuctionHouseById(req, res, next)
);
router.patch(
    ADMIN_ROUTES.AUCTION_HOUSE_UPDATE_STATUS,
    restrictTo('admin'),
    validator(adminValidators.validateAuctionHouseStatusInput),
    (req,res,next)=>adminController.updateAuctionHouseStatus(req,res,next)
)

export default router