import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { WATCH_LIST_ROUTES } from "../constants/route.constant";
import { watchlistController } from "../di/watchList.container";
import { Role } from "../dtos/Common.dto";

const router = Router()
router.use(protect)
router.use(CheckUserBlocked)

router.post(
   WATCH_LIST_ROUTES.ADD_TO_WATCH_LIST,
   allowedTo(Role.USER),
   (req, res, next) => watchlistController.addToWatchList(req, res, next)
)
router.get(
   WATCH_LIST_ROUTES.MY_WATH_LIST,
   allowedTo(Role.USER),
   (req, res, next) => watchlistController.findAllWatchListItems(req, res, next)
)

export default router