import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { adminController } from "../di/container";
import { ADMIN_ROUTES } from "../constants/route.constant";
import { validator } from "../middlewares/validation.middleware";
import { adminValidators } from "../validators/admin.validators";
import { Role } from "../dtos/Common.dto";

const router = Router()
router.use(protect)
router.get(
    ADMIN_ROUTES.GET_AUCTION_HOUSES,
    allowedTo(Role.ADMIN),
    (req, res, next) => adminController.getAuctionHouses(req, res, next)
)
router.get(
    ADMIN_ROUTES.GET_AUCTION_HOUSE,
    allowedTo(Role.ADMIN),
    (req, res, next) => adminController.getAuctionHouseById(req, res, next)
);
router.patch(
    ADMIN_ROUTES.AUCTION_HOUSE_UPDATE_STATUS,
    allowedTo(Role.ADMIN),
    validator(adminValidators.validateAuctionHouseStatusInput),
    (req, res, next) => adminController.updateAuctionHouseStatus(req, res, next)
)
router.get(
    ADMIN_ROUTES.GET_USERS,
    allowedTo(Role.ADMIN),
    (req,res,next)=>adminController.getAllUsers(req,res,next)
)
router.get(
    ADMIN_ROUTES.GET_USER,
    allowedTo(Role.ADMIN),
    (req,res,next)=>adminController.getUserById(req,res,next)
)
router.patch(
    ADMIN_ROUTES.USER_UPDATE_STATUS,
    allowedTo(Role.ADMIN),
    validator(adminValidators.validateUserStatusUpdateInput),
    (req,res,next)=>adminController.updateUserStatus(req,res,next)
)
export default router