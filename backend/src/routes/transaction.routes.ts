import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { transactionController } from "../di/transaction.container";
import { TRANSACTION_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";

const router = Router()
router.use(protect);
router.use(CheckUserBlocked)

router.get(
    TRANSACTION_ROUTES.LIST_TRANSACTIONS,
    allowedTo(Role.USER),
    (req, res, next) => transactionController.listTransactions(req, res, next)
)

export default router;