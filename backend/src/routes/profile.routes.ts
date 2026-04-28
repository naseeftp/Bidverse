import { Router } from "express";
import { protect,allowedTo} from "../middlewares/auth.middleware";
import { profileController } from "../di/profile.container";
import { Role } from "../dtos/Common.dto";
import { PROFILE_ROUTES } from "../constants/route.constant";

const router= Router()
router.use(protect)

router.get(
PROFILE_ROUTES.GET_PROFILE,
allowedTo(Role.USER),
(req,res,next)=>profileController.getProfile(req,res,next)
)

export default router
