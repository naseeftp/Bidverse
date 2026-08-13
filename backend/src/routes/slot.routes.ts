import { Router } from "express";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { SLOT_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import { slotController } from "../di/slot.container";


const router = Router();
router.use(protect)
router.use(CheckUserBlocked)

router.post(
    SLOT_ROUTES.BOOK_SLOT,
    allowedTo(Role.USER),
    (req, res, next) => slotController.bookSlot(req, res, next)
)
router.get(
    SLOT_ROUTES.MY_SLOTS,
    allowedTo(Role.USER),
    (req, res, next) => slotController.listAllSlotForUser(req, res, next)
)

export default router;