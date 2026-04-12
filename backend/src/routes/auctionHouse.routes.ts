import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { validator } from "../middlewares/validation.middleware";
import { AuctionHouseValidators } from "../validators/auctionHouse.validators";
import { AUCTION_HOUSE_ROUTES } from '../constants/route.constant'
import { auctionHouseController } from "../di/container";

const router = Router();
router.use(protect);

router.post(
    AUCTION_HOUSE_ROUTES.VERIFY,
    restrictTo("tenant"),
    validator(AuctionHouseValidators.validateVerificationInput),
    (req, res, next) => auctionHouseController.submitVerification(req as any, res, next)
)
router.get(
    AUCTION_HOUSE_ROUTES.PROFILE,
    restrictTo('tenant'),
    (req, res, next) => auctionHouseController.getProfile(req, res, next)
)
router.get(
    AUCTION_HOUSE_ROUTES.UPLOAD_SIGNATURE,
    restrictTo("tenant"),
    (req, res, next) => auctionHouseController.getUploadSignature(req, res, next)
)

export default router;