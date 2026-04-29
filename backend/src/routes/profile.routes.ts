import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { profileController } from "../di/profile.container";
import { Role } from "../dtos/Common.dto";
import { PROFILE_ROUTES } from "../constants/route.constant";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { ProfileValidators } from "../validators/profile.validators";
import { validator } from "../middlewares/validation.middleware";

const router = Router()
router.use(protect)
router.use(CheckUserBlocked)

router.get(
    PROFILE_ROUTES.GET_PROFILE,
    allowedTo(Role.USER),
    (req, res, next) => profileController.getProfile(req, res, next)
)
router.patch(
    PROFILE_ROUTES.CHANGE_DETAILS,
    allowedTo(Role.USER),
    validator(ProfileValidators.profileDeatailsChangeValidator),
    (req, res, next) => profileController.changeProfileDetails(req, res, next)
)
router.patch(
    PROFILE_ROUTES.CHANGE_PASSWORD,
    allowedTo(Role.USER),
    validator(ProfileValidators.changePasswordValidator),
    (req, res, next) => profileController.changePassword(req, res, next)
)
export default router
