import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { LIVE_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import liveController from "../di/live.container";


const router = Router();
router.use(protect);
router.use(CheckUserBlocked)
router.get(
    LIVE_ROUTES.GET_LIVE_STATE,
    allowedTo(Role.TENANT, Role.USER),
    (req, res, next) => liveController.findLiveState(req, res, next)
)
router.get(
    LIVE_ROUTES.JOIN_ROOM,
    allowedTo(Role.USER),
    (req, res, next) => liveController.joinRoom(req, res, next)
)
router.patch(
    LIVE_ROUTES.START_LIVE,
    allowedTo(Role.TENANT),
    (req, res, next) => liveController.startLive(req, res, next)
)
router.post(
    LIVE_ROUTES.PLACE_BID,
    allowedTo(Role.USER),
    (req, res, next) => liveController.placeBid(req, res, next)
)
router.patch(
    LIVE_ROUTES.PAUSE_LIVE,
    allowedTo(Role.TENANT),
    (req, res, next) => liveController.pauseLive(req, res, next)
)
export default router;