import { Router } from "express";
import stripeWebhookController from "../di/payment.container";
import { WEBHOOK_ROUTES } from "../constants/route.constant";

const router=Router();
router.post(
  WEBHOOK_ROUTES.STRIPE,
  (req,res,next)=>stripeWebhookController.handleStripeWebhook(req,res,next)
)
export default router