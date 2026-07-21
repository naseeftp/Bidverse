import { Router } from "express";
import { CheckUserBlocked } from "../middlewares/check-user-blocked-middleware";
import { protect, allowedTo } from "../middlewares/auth.middleware";
import { CHAT_ROUTES } from "../constants/route.constant";
import { Role } from "../dtos/Common.dto";
import { chatController } from "../di/chat.container";

const router = Router()
router.use(protect);
router.use(CheckUserBlocked)

router.post(
   CHAT_ROUTES.GET_OR_CREATE_CONVO,
   allowedTo(Role.USER, Role.TENANT, Role.ADMIN),
   (req, res, next) => chatController.getOrCreateConversation(req, res, next)
)
router.get(
   CHAT_ROUTES.GET_USER_CONVO,
   allowedTo(Role.USER, Role.TENANT),
   (req, res, next) => chatController.getUserConversations(req, res, next)
)
router.post(
   CHAT_ROUTES.SEND_MESSAGE,
   allowedTo(Role.USER, Role.TENANT, Role.ADMIN),
   (req, res, next) => chatController.sendMessage(req, res, next)
)
router.get(
   CHAT_ROUTES.GET_MESSAGES,
   allowedTo(Role.USER, Role.TENANT, Role.ADMIN),
   (req, res, next) => chatController.getMessages(req, res, next)
)
router.delete(
   CHAT_ROUTES.DELETE_EVERYONE,
   allowedTo(Role.USER, Role.TENANT, Role.ADMIN),
   (req,res,next)=>chatController.deleteForEveryOne(req,res,next)
)
export default router;