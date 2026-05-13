import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { validator } from "../middlewares/validation.middleware";
import { AuctionHouseValidators } from "../validators/auctionHouse.validators";
import { AUCTION_HOUSE_ROUTES } from '../constants/route.constant'
import { auctionHouseController } from "../di/container";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { Role } from "../dtos/Common.dto";

const router = Router();
router.use(protect);
router.use(CheckUserBlocked )
router.post(
    AUCTION_HOUSE_ROUTES.VERIFY,
    allowedTo(Role.TENANT),
    validator(AuctionHouseValidators.validateVerificationInput),
    (req, res, next) => auctionHouseController.submitVerification(req, res, next)
)

router.get(
    AUCTION_HOUSE_ROUTES.PROFILE,
    allowedTo(Role.TENANT),
    (req, res, next) => auctionHouseController.getProfile(req, res, next)
)
router.get(
    AUCTION_HOUSE_ROUTES.UPLOAD_SIGNATURE,
    allowedTo(Role.TENANT),
    (req, res, next) => auctionHouseController.getUploadSignature(req, res, next)
)

export default router;